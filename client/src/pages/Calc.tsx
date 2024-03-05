import React, { useState, useEffect, useMemo } from 'react';

const Calc = () => {
    const [numBanks, setNumBanks] = useState(1);
    const [bankAmounts, setBankAmounts] = useState(Array(numBanks).fill(0));
    const [initialTotalChecked, setInitialTotalChecked] = useState(false);
    const [initialTotalAmount, setInitialTotalAmount] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');

    const totalAmount = useMemo(() => {
        const totalFromTransactions = transactions.reduce((acc, cur) => acc + (cur.type === 'income' ? cur.amount : -cur.amount), 0);
        const totalFromBanks = bankAmounts.reduce((acc, cur) => acc + cur, 0);
        return totalFromTransactions + initialTotalAmount + totalFromBanks;
    }, [transactions, bankAmounts, initialTotalAmount]);

    const handleAddTransaction = () => {
        if (!amount.trim()) return;

        const newTransaction = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            amount: parseFloat(amount),
            timestamp: new Date().toISOString(),
        };

        setTransactions([...transactions, newTransaction]);
        setAmount('');
    };

    const handleNumBanksChange = (e) => {
        const newNumBanks = parseInt(e.target.value);
        setNumBanks(newNumBanks);
        setBankAmounts(Array(newNumBanks).fill(0));
    };

    const handleBankAmountChange = (index, value) => {
        const newBankAmounts = [...bankAmounts];
        newBankAmounts[index] = parseFloat(value);
        setBankAmounts(newBankAmounts);
    };

    return (
        <div className='container mx-auto py-8'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                <BankSection
                    numBanks={numBanks}
                    initialTotalChecked={initialTotalChecked}
                    initialTotalAmount={initialTotalAmount}
                    setInitialTotalChecked={setInitialTotalChecked}
                    setInitialTotalAmount={setInitialTotalAmount}
                    totalAmount={totalAmount}
                    setNumBanks={setNumBanks}
                    handleNumBanksChange={handleNumBanksChange}
                    bankAmounts={bankAmounts}
                    setBankAmounts={setBankAmounts}
                    handleBankAmountChange={handleBankAmountChange}
                />
                <TransactionSection
                    type={type}
                    setType={setType}
                    amount={amount}
                    setAmount={setAmount}
                    handleAddTransaction={handleAddTransaction}
                />
                <TransactionsList transactions={transactions} />
            </div>
        </div>
    );
}

const BankSection = ({
    numBanks,
    initialTotalChecked,
    initialTotalAmount,
    setInitialTotalChecked,
    setInitialTotalAmount,
    totalAmount,
    setNumBanks,
    handleNumBanksChange,
    bankAmounts,
    setBankAmounts,
    handleBankAmountChange
}) => {
    return (
        <div className="md:col-span-1 bg-[#0c0c0c] text-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Number of Banks</h2>
            <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-300"
                type="number"
                min="1"
                value={numBanks}
                onChange={handleNumBanksChange}
            />
            <h2 className="text-lg font-bold mt-8 mb-4">Total Amount</h2>
            <span className="text-2xl">${totalAmount.toFixed(2)}</span>
            <div className="mt-4">
                <label className="block text-gray-400 text-sm font-bold mb-2">
                    Set Initial Total Amount
                    <input
                        type="checkbox"
                        className="ml-2 form-checkbox text-gray-400 h-4 w-4"
                        checked={initialTotalChecked}
                        onChange={(e) => setInitialTotalChecked(e.target.checked)}
                    />
                </label>
                {initialTotalChecked && (
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-300"
                        type="number"
                        placeholder="Enter initial total amount"
                        value={initialTotalAmount}
                        onChange={(e) => setInitialTotalAmount(parseFloat(e.target.value))}
                    />
                )}
            </div>
            {Array.from({ length: numBanks }).map((_, index) => (
                <div key={index} className="mt-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Bank {index + 1}</label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-300"
                        type="number"
                        placeholder="Enter amount"
                        value={bankAmounts[index]}
                        onChange={(e) => handleBankAmountChange(index, e.target.value)}
                    />
                </div>
            ))}
        </div>
    );
}

const TransactionSection = ({
    type,
    setType,
    amount,
    setAmount,
    handleAddTransaction
}) => {
    return (
        <div className="md:col-span-1 bg-[#0c0c0c] text-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Add Transaction</h2>
            <div className="mb-4">
                <label className="block text-gray-400 text-sm font-bold mb-2">Amount</label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-300"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-400 text-sm font-bold mb-2">Type</label>
                <div>
                    <label className="flex items-center text-sm text-gray-400">
                        <input
                            type="checkbox"
                            className="form-checkbox text-gray-400 h-4 w-4 mr-2"
                            checked={type === 'expense'}
                            onChange={() => setType('expense')}
                        />
                        Expense
                    </label>
                    <label className="flex items-center text-sm text-gray-400">
                        <input
                            type="checkbox"
                            className="form-checkbox text-gray-400 h-4 w-4 mr-2"
                            checked={type === 'income'}
                            onChange={() => setType('income')}
                        />
                        Income
                    </label>
                </div>
            </div>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handleAddTransaction}
            >
                Add Transaction
            </button>
        </div>
    );
}

const TransactionsList = ({ transactions }) => {
    return (
        <div className="md:col-span-1 bg-[#0c0c0c] text-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Transactions</h2>
            <ul className="space-y-4">
                {transactions.map((transaction) => (
                    <li key={transaction.id} className="border-b border-gray-600 pb-2">
                        <div>
                            <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                {transaction.type === 'income' ? '+' : '-'} ${transaction.amount.toFixed(2)}
                            </span>
                            <span className="text-gray-400 ml-2">{new Date(transaction.timestamp).toLocaleString()}</span>
                        </div>
                    </li>
                ))}
            </ul>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 focus:outline-none focus:shadow-outline"
                onClick={() => window.print()}
            >
                Print Transactions
            </button>
        </div>
    );
}

export default Calc;
