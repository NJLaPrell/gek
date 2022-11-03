
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue, Firestore } from 'firebase-admin/firestore';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require('../serviceAccountKey.json');

export class DataStore {
  private db!: Firestore;

  constructor() {
    initializeApp({
      credential: cert(serviceAccount)
    });

    this.db = getFirestore();
  }

  public saveUser(user: any) {
    const docRef = this.db.collection('users').doc(user.id);
    return docRef.set(user);
  }

  public  getUser = async (id: string): Promise<any> => {
    const doc = await this.db.collection('users').doc(id).get();
    return doc.data();
  };
}