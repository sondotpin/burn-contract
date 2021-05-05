import chai, { expect } from 'chai';
import asPromised from 'chai-as-promised';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Blockchain } from '../utils/Blockchain';
import { generatedWallets } from '../utils/generatedWallets';
import { ethers, Wallet } from 'ethers';
import { AddressZero } from '@ethersproject/constants';
import {
  approveCurrency,
  deployCurrency,
  getBalance,
  mintCurrency,
  toNumWei,
} from './utils';
import {
  arrayify,
  formatBytes32String,
  sha256,
} from 'ethers/lib/utils';
import { BaseErc20Factory, MyContractFactory } from '../typechain';

chai.use(asPromised);

let provider = new JsonRpcProvider();
let blockchain = new Blockchain(provider);

describe('Contract', () => {
  let [
    deployerWallet,
    wallet1,
    wallet2,
  ] = generatedWallets(provider);

  beforeEach(async () => {
    await blockchain.resetAsync();
  });

  it('#test', async () => {
    const primaryToken = await (
      await new BaseErc20Factory(deployerWallet).deploy(
        "PrimaryToken",
        "PrimaryToken",
        18
      )
    ).deployed();
    const secondaryToken1 = await (
      await new BaseErc20Factory(deployerWallet).deploy(
        "SecondaryToken1",
        "SecondaryToken1",
        18
      )
    ).deployed();
    const secondaryToken2 = await (
      await new BaseErc20Factory(deployerWallet).deploy(
        "secondaryToken2",
        "secondaryToken2",
        18
      )
    ).deployed();

    const contract = await (
      await new MyContractFactory(deployerWallet).deploy(
        primaryToken.address,
        secondaryToken1.address,
        secondaryToken2.address,
      )
    )

    await primaryToken.connect(deployerWallet).mint(wallet1.address, 100);
    await primaryToken.connect(deployerWallet).mint(contract.address, 9900);
    await secondaryToken1.connect(deployerWallet).mint(contract.address, 1000);
    await secondaryToken2.connect(deployerWallet).mint(contract.address, 1000);

    await primaryToken.connect(wallet1).approve(contract.address, 100);
    await contract.connect(wallet1).deposit(100);

    const [
      balanceAccount1PrimaryAfter,
      totalAmountPrimaryAfter,
      balanceAccount1Secondary1,
      balanceAccount1Secondary2,
    ] = await Promise.all([
      primaryToken.balanceOf(wallet1.address),
      primaryToken.totalSupply(),
      secondaryToken1.balanceOf(wallet1.address),
      secondaryToken2.balanceOf(wallet1.address),
    ]);
    expect(balanceAccount1PrimaryAfter.toNumber()).eq(0);
    expect(totalAmountPrimaryAfter.toNumber()).eq(9900);
    expect(balanceAccount1Secondary1.toNumber()).eq(10);
    expect(balanceAccount1Secondary2.toNumber()).eq(10);
  });
});
