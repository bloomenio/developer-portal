import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiKeyModel } from '@core/models/api-key.model';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { throwError, Observable, of, from, empty, iif } from 'rxjs';
import { ERC223Contract } from '@core/core.module';
import { Web3Service } from '@services/web3/web3.service';
import { USE_DEFAULT_LANG } from '@ngx-translate/core';


@Injectable({providedIn: 'root'})
export class ApiKeysService {

  constructor(
    private httpClient: HttpClient,
    private web3Service: Web3Service,
  ) {}

  public search(q: string = '', limit: number = 20, offset: number = 0): Observable<ApiKeyModel[]>  {
    return this.httpClient
    .get('/api-keys', {
      params: {
        q,
        limit: limit + '',
        offset: offset + '',
      }
    })
    .pipe(
        map((body: any) => body.items)
    );
  }

  public add(item: ApiKeyModel): Observable<ApiKeyModel>  {
    return this.httpClient
    .post('/api-keys', item)
    .pipe(
        map((body: any) => body)
    );
  }

  public pay(name: string, id: string, amount: number): Observable<ApiKeyModel> {
    return of({}).pipe(
      mergeMap(v => {
          if (amount) {
            return from((<ERC223Contract>this.web3Service.getContract(ERC223Contract.ADDRESS)).buy(amount, name));
          } else {
            return of({});
          }
        }
      ),
      mergeMap( () => this.redeem(id))
    );
  }

  public redeem(id: string): Observable<ApiKeyModel>  {
    return this.httpClient
    .put(`/api-keys/${id}/redeem`, undefined)
    .pipe(
        map((body: any) => body)
    );
  }

  public update(id: string, item: ApiKeyModel): Observable<ApiKeyModel>  {
    return this.httpClient
    .put(`/api-keys/${id}`, item)
    .pipe(
        map((body: any) => body)
    );
  }

  public delete(id: string)  {
    return this.httpClient
    .delete(`/api-keys/${id}`)
    .pipe(
        map((body: any) => body)
    );
  }

}
