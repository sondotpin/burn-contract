// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.8;

import "./BaseERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title A media value system, with perpetual equity to creators
 * @notice This contract provides an interface to mint media with a market
 * owned by the creator.
 */
contract MyContract {
    address primaryContract;
    address secondaryContract1;
    address secondaryContract2;

    constructor(
        address _primaryContract,
        address _secondaryContract1,
        address _secondaryContract2
    ) public {
        primaryContract = _primaryContract;
        secondaryContract1 = _secondaryContract1;
        secondaryContract2 = _secondaryContract2;
    }

    function deposit(uint256 amount) external {
        uint256 totalSupply = IERC20(primaryContract).totalSupply();
        uint256 amountOfSecondaryContract1 = IERC20(secondaryContract1).balanceOf(address(this));
        uint256 amountOfSecondaryContract2 = IERC20(secondaryContract2).balanceOf(address(this));

        IERC20(primaryContract).transferFrom(msg.sender, address(this), amount);
        BaseERC20(primaryContract).burn(amount);

        IERC20(secondaryContract1).transfer(msg.sender, amountOfSecondaryContract1 * amount / totalSupply);
        IERC20(secondaryContract2).transfer(msg.sender, amountOfSecondaryContract2 * amount / totalSupply);
    }
}
