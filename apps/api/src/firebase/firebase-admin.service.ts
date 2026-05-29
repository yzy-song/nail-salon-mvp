import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { existsSync, readFileSync } from 'fs';
import { resolve, join } from 'path';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private initialized = false;

  onModuleInit() {
    if (admin.apps.length > 0) {
      this.initialized = true;
      return;
    }

    const possiblePaths = [
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      join(__dirname, '..', '..', 'firebase-service-account-key.json'),
      resolve('./firebase-service-account-key.json'),
    ].filter(Boolean) as string[];

    let lastError: Error | null = null;

    for (const serviceAccountPath of possiblePaths) {
      try {
        if (!existsSync(serviceAccountPath)) {
          this.logger.debug(`Service account file not found at: ${serviceAccountPath}`);
          continue;
        }

        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        this.initialized = true;
        this.logger.log(`Firebase Admin initialized successfully from: ${serviceAccountPath}`);
        return;
      } catch (error) {
        lastError = error as Error;
        this.logger.debug(`Failed to initialize from ${serviceAccountPath}: ${(error as Error).message}`);
      }
    }

    this.logger.error(
      `Firebase Admin initialization failed. Tried paths: ${possiblePaths.join(', ')}. Last error: ${lastError?.message}`,
    );
  }

  get auth() {
    if (!this.initialized && admin.apps.length === 0) {
      this.logger.warn('Firebase Admin is not initialized. Google/Firebase login will fail.');
    }
    return admin.auth();
  }
}
