import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  onModuleInit() {
    if (admin.apps.length === 0) {
      const serviceAccount = JSON.parse(
        readFileSync(join(__dirname, '../../firebase-service-account-key.json'), 'utf8'),
      );
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin initialized.');
    }
  }

  get auth() {
    return admin.auth();
  }
}
