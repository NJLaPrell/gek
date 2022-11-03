import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue, Firestore } from 'firebase-admin/firestore';
import { UserResource } from 'server/models/resource.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require('../serviceAccountKey.json');

export class DataStore {
  private db!: Firestore;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;

    initializeApp({
      credential: cert(serviceAccount)
    });

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
}