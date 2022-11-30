import { cert, ServiceAccount } from 'firebase-admin/app';
import * as firebaseAdmin from 'firebase-admin';

import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { UserAuthToken } from 'server/models/auth.models';
import { UserResource } from 'server/models/resource.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = <ServiceAccount>{
  type: 'service_account',
  project_id: process.env['PROJECT_ID'],
  private_key_id: process.env['PRIVATE_KEY_ID'],
  private_key: process.env['PRIVATE_KEY'],
  client_email: process.env['CLIENT_EMAIL'],
  client_id: process.env['SERVICE_CLIENT_ID'],
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env['CLIENT_X509_CERT_URL']
};



export class DataStore {
  private db!: Firestore;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    
    try {
      firebaseAdmin.initializeApp({ credential: cert(serviceAccount) });
    } catch (e) {
      firebaseAdmin.app();
    }
    
    this.db = getFirestore();
  }

  public saveUser(user: any) {
    const docRef = this.db.collection('users').doc(this.userId);
    return docRef.set(user);
  }

  public  getUser = async (): Promise<any> => {
    const doc = await this.db.collection('users').doc(this.userId).get();
    return doc.data();
  };

  public getResource = async (resourceName: string): Promise<UserResource | undefined> => {
    const doc = await this.db.collection(`resource:${resourceName}`).doc(this.userId).get();
    return <UserResource | undefined>doc.data();
  };

  public saveResource = (resourceName: string, resource: UserResource): Promise<FirebaseFirestore.WriteResult> => 
    this.db.collection(`resource:${resourceName}`).doc(this.userId).set(resource);

  public updateResourceItem = async (resourceName: string, uniqueIdentifier: string, idValue: string, resourceItem: any): Promise<FirebaseFirestore.WriteResult> => {
    const resourceItems = await (await this.db.collection(`resource:${resourceName}`).doc(this.userId).get()).data()?.['items'];
    const updateIx = resourceItems.find((item: any) => item[uniqueIdentifier] === idValue);
    if (updateIx === -1)
      throw { message: `Unable to find a resource item where ${uniqueIdentifier} = "${idValue}"`, code: 404 };

    resourceItems[updateIx] = resourceItem;
    const resource = { lastUpdated: Date.now(), items: resourceItems };
    return this.saveResource(resourceName, resource);
  };

  public deleteResourceItem = async (resourceName: string, uniqueIdentifier: string, idValue: string): Promise<FirebaseFirestore.WriteResult> => {
    const resourceItems = await (await this.db.collection(`resource:${resourceName}`).doc(this.userId).get()).data()?.['items'];
    const deleteIx = resourceItems.find((item: any) => item[uniqueIdentifier] === idValue);
    if (deleteIx === -1)
      throw { message: `Unable to find a resource item where ${uniqueIdentifier} = "${idValue}"`, code: 404 };

    resourceItems.splice(deleteIx, 1);
    const resource = { lastUpdated: Date.now(), items: resourceItems };
    return this.saveResource(resourceName, resource);
  };

  public addResourceItem = async (resourceName: string, resourceItem: any): Promise<FirebaseFirestore.WriteResult> => {
    const resourceItems = await (await this.db.collection(`resource:${resourceName}`).doc(this.userId).get()).data()?.['items'];
    resourceItems.push(resourceItem);
    const resource = { lastUpdated: Date.now(), items: resourceItems };
    return this.saveResource(resourceName, resource);
  };

  public cacheUserAuthToken = async (authToken: UserAuthToken): Promise<boolean> => 
    this.db.collection('auth-tokens').doc(this.userId).set(authToken).then(() => true).catch((e) => {
      console.log(e);
      return false;
    });

  public getUserAuthToken = async (): Promise<UserAuthToken | false> =>
    this.db.collection('auth-tokens').doc(this.userId).get()
      .then((result) => {
        const res = result.data();
        return res ? <UserAuthToken>res : false;
      })
      .catch((e) => {console.log(e); return false;});

  public getAutoSortUsers = async (): Promise<any> => {
    // TODO: Refactor using firestore features. May need to change schema.
    const users = await this.db.collection('resource:preferences').get()
      .then(
        (result) => result.docs.map(
          d => ({ userId: d.id, autoSort: d.data()['items'].find((i: any) => i.name === 'autoSort').value, autoSortInterval: d.data()['items'].find((i: any) => i.name === 'autoSortInterval').value })
        ).filter(d => d.autoSort === true)
      );
    const usersList = users.map(d => d.userId);
    // TODO: Refactor this mess as well.
    return await this.db.collection('resource:history').get()
      .then(
        (result) => result.docs.filter(d => usersList.indexOf(d.id) !== -1).map(doc => ({ userId: doc.id, lastRun: doc.data()['lastUpdated'], autoSortInterval: users.find(u => u.userId === doc.id)?.autoSortInterval }))
      );
  };

  public purgeUserData = async() => {
    const playlists = await (await this.db.collection('resource:playlists').doc(this.userId).get()).data();
    const playlistIds = playlists?.['items']?.map((i: any) => i.playlistId);

    // Playlists
    while (playlistIds?.length) {
      const doc = await this.db.collection(`resource:playlist:${playlistIds.pop()}`).doc(this.userId);
      if (await (await doc.get()).exists) {
        await doc.delete();
      }
    }

    // All other resources
    const collections = ['playlists', 'preferences', 'rules', 'subscriptions', 'unsortedVideos', 'errorQueue', 'history'];
    while (collections?.length) {
      const doc = await this.db.collection(`resource:${collections.pop()}`).doc(this.userId);
      if (await (await doc.get()).exists) {
        await doc.delete();
      }
    }

    // Auth Token
    const authToken = await this.db.collection('auth-tokens').doc(this.userId);
    if (await (await authToken.get()).exists) {
      await authToken.delete();
    }
   
  };

}