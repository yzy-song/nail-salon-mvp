import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
// 1. Use import to load the JSON file
import * as serviceAccount from '../../firebase-service-account-key.json';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  onModuleInit() {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        // 2. Cast the imported JSON to the correct type
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
      console.log('Firebase Admin initialized.');
    }
  }

  get auth() {
    return admin.auth();
  }
}
