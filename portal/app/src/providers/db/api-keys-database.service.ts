// Basic
import { Injectable } from '@angular/core';
import { NgForage } from 'ngforage';
import { from, Observable} from 'rxjs';

// Services
import { StorageService } from '@services/storage/storage.service';

// Config
import { apiKeysConfig } from '@config/api-keys.db.config';

/**
 * Application data database service to access to the persistance data.
 */
@Injectable({ providedIn: 'root' })
export class ApiKeysDatabaseService {

  /**
   * Application data database instance
   */
  private apiKeyDatabase: NgForage;

  /**
   * Constructor where we import all needed in the service.
   * @param storageService instance of the storage general service.
   */
  constructor(private storageService: StorageService) {
    this.apiKeyDatabase = this.storageService.create(apiKeysConfig.databaseConfig);
  }

  /**
   * Method to get an application data stored inside database.
   * @param key Primary key to get the value inside the database.
   */
  public get(key: string): Observable<any> {
    return from(this.storageService.get(this.apiKeyDatabase, apiKeysConfig.encryption, key));
  }

  /**
   * Method to set an application data inside database.
   * @param key Primary key to be stored inside the database.
   * @param value Value to be stored inside the database
   */
  public set(key: string, value: any): Observable<any> {
    return from(this.storageService.set(this.apiKeyDatabase, apiKeysConfig.encryption, key, value));
  }

  /**
   * Delete the application data of the key provided by parameter.
   * @param key Primary key to delete the value.
   */
  public remove(key: string): Observable<any> {
    return from(this.storageService.remove(this.apiKeyDatabase, key));
  }
}
