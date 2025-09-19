// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MicroLoanFactory.sol";

contract DeployFactoryOnly is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address usdcAddress = vm.envAddress("USDC_ADDRESS");

        // Use existing BusinessRegistry address from subgraph
        address businessRegistryAddress = 0x0982231554808AC4e165c7D2BC3B9B636743E51f;

        vm.startBroadcast(deployerPrivateKey);

        MicroLoanFactory factory = new MicroLoanFactory(
            businessRegistryAddress,
            usdcAddress
        );
        console.log("MicroLoanFactory deployed at:", address(factory));
        console.log("Using existing BusinessRegistry at:", businessRegistryAddress);

        vm.stopBroadcast();
    }
}