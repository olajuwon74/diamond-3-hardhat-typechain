
/* global ethers */
/* eslint prefer-const: "off" */

import { ethers } from "hardhat";
import { DiamondCutFacet } from "../typechain-types";

import { getSelectors, FacetCutAction } from './libraries/diamond';

async function deployDiamond () {
  const accounts = await ethers.getSigners()
  const contractOwner = accounts[0]

  // deploy DiamondCutFacet

 
    // Get the NewFactory and deploy to generate address
  const NewFacet = await ethers.getContractFactory('New_stuff');
  const newFacet = await NewFacet.deploy();
  await newFacet.deployed();

//   Diamond Address 
const diamondAddr = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
let cut = []
cut.push({
    facetAddress: newFacet.address,
    action: FacetCutAction.Remove,
    functionSelectors: getSelectors(newFacet)
  })


  // upgrade diamond with facets
  console.log('')
  console.log('Diamond Cut:', cut)
  const diamondCut = await ethers.getContractAt('IDiamondCut', diamondAddr) as DiamondCutFacet
  let tx
  let receipt


  // call to changeValue function from the NewFacet Contract
  let functionCall = newFacet.interface.encodeFunctionData('addUp', ['3'])
  tx = await diamondCut.diamondCut(cut, diamondAddr, functionCall)

//   Console log the tx hash.
  console.log('Diamond cut tx: ', tx.hash)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
  }
  console.log('Completed diamond cut')
  return diamondAddr;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployDiamond()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deployDiamond = deployDiamond