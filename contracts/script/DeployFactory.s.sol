// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MicroLoanFactory.sol";
import "../src/BusinessRegistry.sol";

contract DeployFactory is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address usdcAddress = vm.envAddress("USDC_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        BusinessRegistry registry = new BusinessRegistry();
        console.log("BusinessRegistry deployed at:", address(registry));

        MicroLoanFactory factory = new MicroLoanFactory(
            address(registry),
            usdcAddress
        );
        console.log("MicroLoanFactory deployed at:", address(factory));

        vm.stopBroadcast();
    }
}