import {TransactionsExplorer} from "../model/TransactionsExplorer";
import {Wallet} from "../model/Wallet";
import {Mnemonic} from "../model/Mnemonic";

//bridge for cnUtil with the new mnemonic class
(<any>self).mn_random = Mnemonic.mn_random;
(<any>self).mn_decode = Mnemonic.mn_decode;
(<any>self).mn_encode = Mnemonic.mn_encode;

let currentWallet : Wallet|null = null;

onmessage = function(data : MessageEvent){
	if(data.isTrusted){
		let event : any = data.data;
		// console.log(event);
		if(event.type === 'initWallet'){
			currentWallet = Wallet.loadFromRaw(event.wallet,true);
			postMessage('readyWallet');
		}else if (event.type === 'process'){
			if(currentWallet === null){
				postMessage('missing_wallet');
				return;
			}

			let rawTransactions : RawDaemonTransaction[] = event.transactions;
			let transactions : any[] = [];
			for(let rawTransaction of rawTransactions){
				let transaction = TransactionsExplorer.parse(rawTransaction, currentWallet);
				if(transaction !== null){
					transactions.push(transaction.export());
				}
			}

			postMessage({
				type:'processed',
				transactions:transactions
			});
		}
		// let transaction = TransactionsExplorer.parse(rawTransaction, height, this.wallet);
	}
};

postMessage('ready');