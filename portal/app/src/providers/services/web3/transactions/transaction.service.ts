
// Basic
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Environment
import { environment } from '@env/environment';

// Services
import { Logger } from '@services/logger/logger.service';
import { Web3Service } from '@services/web3/web3.service';

const log = new Logger('transaction.service');

export class Transaction {
  public promise: Promise<any>;
  public resolve: any;
  public reject: any;
  public error: any;
  constructor(
    public txhash: string,
    public gas: number
  ) {
    this.txhash = txhash;
    this.gas = gas;
    this.promise = new Promise<any>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

@Injectable({providedIn: 'root'})
export class TransactionService {
  private transactions: BehaviorSubject<Transaction[]> = new BehaviorSubject<Transaction[]>([]);

  constructor(
    private web3Service: Web3Service
  ) {
    this.doTick();
  }


  public getTransactions(): Observable<Transaction[]> {
    return this.transactions.asObservable();
  }

  public addTransaction( gas: number, callback: () => any): Promise<any> {
    const newTr = new Transaction(null, gas);
    this.transactions.getValue().push(newTr);
    this.transactions.next(this.transactions.getValue());

    try {
      const now = new Date().getMilliseconds();
      callback().then(
        (response: any) => {
          if (response.transactionHash) {
            // send transaction
            newTr.txhash = response.transactionHash;
          } else {
            // call transaction
            const delayTime = environment.eth.transactionCallDelayTime - (new Date().getMilliseconds() - now );
            setTimeout(() => {
              this.transactions.getValue().shift();
              this.transactions.next(this.transactions.getValue());
              newTr.resolve(response);
            }, delayTime);
          }

        },
        (error: any) => {
          log.error(error);
          newTr.error = error;
        });
    } catch (exception) {
      this.transactions.getValue().shift();
      this.transactions.next(this.transactions.getValue());
      newTr.reject(exception);
    }
    return newTr.promise;
  }

  private doTick() {
    if (this.transactions.getValue().length > 0) {
      const tx = this.transactions.getValue()[0];
      if (tx.txhash) {
        this.web3Service.checkTransactionStatus(tx.txhash).then(
          (txStatus: any) => {
            if (txStatus) {
              if ((txStatus.gasUsed > 0) && ((tx.gas - txStatus.gasUsed) > 0)) {
                tx.resolve(txStatus);
              } else {
                tx.reject(txStatus);
              }
              this.transactions.getValue().shift();
              this.transactions.next(this.transactions.getValue());
            }
          }
        );
      } else if (tx.error) {
        tx.reject(tx.error);
        this.transactions.getValue().shift();
        this.transactions.next(this.transactions.getValue());
      }
    }
    setTimeout(() => this.doTick(), environment.eth.transactionStatusPollingTime);
  }
}
