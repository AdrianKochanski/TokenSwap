const { expect, use } = require('chai');
const web3 = require('web3');
const { solidity } = require('ethereum-waffle');
const chaiAlmost = require('chai-almost');

use(solidity);
use(chaiAlmost(0.0000000001));

contract('TokenSwap', accounts => {
    const TokenSwap = artifacts.require('TokenSwap.sol');
    const ERC20TK1 = artifacts.require('ERC20TK1.sol');
    const ERC20TK2 = artifacts.require('ERC20TK2.sol');
    const user = accounts[1];

    let tokenSwap, erc20TK1, erc20TK2, erc20TK1supply, erc20TK2supply, amountTK1, amountTK2;
    const initialPrice = 3;
    const changePrice = 0.84;
    const changePriceOverflow = 0.001;

    beforeEach(async () => {
        erc20TK1 = await ERC20TK1.new();
        erc20TK2 = await ERC20TK2.new();
        tokenSwap = await TokenSwap.new(erc20TK1.address, erc20TK2.address, toWei(initialPrice, 'ether'));
        erc20TK1supply = fromWei(await erc20TK1.totalSupply(), 'ether');
        erc20TK2supply = fromWei(await erc20TK2.totalSupply(), 'ether');
        amountTK1 = toWei(erc20TK1supply / 10, 'ether');
        amountTK2 = toWei(erc20TK2supply / 2, 'ether');
    });

    describe('Deposit', () => {
        it('Reverts when deposit a different coin', async () => {
            const erc20TK_false = await ERC20TK2.new();
            await erc20TK_false.approve(tokenSwap.address, amountTK2);
            expect(tokenSwap.deposit(erc20TK_false.address, amountTK2)).to.revertedWith('Deposit not allowed!');
        });
    });

    describe('Exchange', () => {
        let balanceTK1BeforeSwap, balanceTK2BeforeSwap;

        beforeEach(async () => {
            await erc20TK2.approve(tokenSwap.address, amountTK2);
            await tokenSwap.deposit(erc20TK2.address, amountTK2);
            await erc20TK1.transfer(user, amountTK1);
            await erc20TK1.approve(tokenSwap.address, amountTK1, { from: user });

            balanceTK1BeforeSwap = fromWei(await erc20TK1.balanceOf(user), 'ether');
            balanceTK2BeforeSwap = fromWei(await erc20TK2.balanceOf(user), 'ether');
        });

        describe('Successfull call', () => {
            let priceToCheck = 0;

            it("Allows users to swap a token", async () => {
                await tokenSwap.exchange(erc20TK1.address, amountTK1, {from: user});
                priceToCheck = initialPrice;
            });
    
            it("Changes swap amount after updating the price", async () => {
                await tokenSwap.updatePrice(toWei(changePrice, 'ether'));
                await tokenSwap.exchange(erc20TK1.address, amountTK1, {from: user});
                priceToCheck = changePrice;
            });

            afterEach(async () => {
                const balanceTK1AfterSwap = fromWei(await erc20TK1.balanceOf(user), 'ether');
                const balanceTK2AfterSwap = fromWei(await erc20TK2.balanceOf(user), 'ether');
                
                expect(balanceTK2BeforeSwap == 0).to.be.true;
                expect(balanceTK2AfterSwap == 0).to.be.false;
                expect(balanceTK1BeforeSwap/balanceTK2AfterSwap).to.almost.equal(priceToCheck);
                expect(balanceTK1AfterSwap == 0).to.be.true;
            });
        })


        it("Reverts when there is not enough token amount to swap", async () => {
            await tokenSwap.updatePrice(toWei(changePriceOverflow, 'ether'));
            expect(tokenSwap.exchange(erc20TK1.address, amountTK1, {from: user})).to.revertedWith("ERC20 balance too low!");

            const balanceTK1AfterSwap = fromWei(await erc20TK1.balanceOf(user), 'ether');
            const balanceTK2AfterSwap = fromWei(await erc20TK2.balanceOf(user), 'ether');
            expect(balanceTK1BeforeSwap == balanceTK1AfterSwap).to.be.true;
            expect(balanceTK2BeforeSwap == balanceTK2AfterSwap).to.be.true;
        });

        it("Reverts when exchange a different coin", async () => {
            const erc20TK_false = await ERC20TK2.new();
            await erc20TK_false.approve(tokenSwap.address, amountTK2);
            expect(tokenSwap.exchange(erc20TK_false.address, amountTK2)).to.revertedWith("Exchange not allowed!");
        });
    });
})

function toWei(amount, unit) {
    return web3.utils.toWei(amount.toString(), unit);
}

function fromWei(amount, unit) {
    return web3.utils.fromWei(amount.toString(), unit);
}