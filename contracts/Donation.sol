pragma solidity ^0.4.18;

contract Donation {
    address public owner;
    Donor[] private donors;
    address public ong;
    uint256 public balanceDonation;
    uint256 public minimumDonation;
    uint256 public timeUnlockBalance;

    enum StatusDonation{OPEN, CLOSE}
    StatusDonation public statusDonation;

    event LogReceiveDonation(address donor, uint256 value);
    event LogWithdraw(address donor);

    struct Donor {
        address donor;
        uint256 value;
        uint256 timeDonation;
    }

    function Donation(uint256 _minimumDonation, address _ong, uint256 _timeUnlockBalance)
        public canBeStoredWith128Bits(_minimumDonation) canBeStoredWith64Bits(_timeUnlockBalance)
    {
        owner = msg.sender;
        statusDonation = StatusDonation.OPEN;
        minimumDonation = _minimumDonation;
        ong = _ong;
        timeUnlockBalance = _timeUnlockBalance;
    }

    modifier canBeStoredWith128Bits(uint256 _value) {
        require(_value < 340282366920938463463374607431768211455);
        _;
    }

    modifier canBeStoredWith64Bits(uint256 _value) {
        require(_value <= 18446744073709551615);
        _;
    }

    modifier onlyOnwer() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyMinimumDonationOnwer() {
        require(msg.value >= minimumDonation);
        _;
    }

    modifier isAvailableWithdraw() {
        require(now >= timeUnlockBalance && statusDonation == StatusDonation.OPEN);
        _;
    }  

    modifier onlyClosed() {
        require(statusDonation == StatusDonation.CLOSE);
        _;
    }  

    function setMinimumDonation(uint256 _minimumDonation) public
        onlyOnwer onlyClosed canBeStoredWith128Bits(_minimumDonation)
    {
        minimumDonation = _minimumDonation;
    }

    function setOng(address _ong) public onlyOnwer onlyClosed {
        ong = _ong;
    }

    function setTimeUnlockBalance(uint256 _timeUnlockBalance) public onlyOnwer onlyClosed canBeStoredWith64Bits(_timeUnlockBalance) {
        timeUnlockBalance = _timeUnlockBalance;
    }

    function() public payable canBeStoredWith128Bits(msg.value) onlyMinimumDonationOnwer {
        require(statusDonation == StatusDonation.OPEN);

        balanceDonation += msg.value;

        Donor memory donor = Donor(msg.sender, msg.value, now);
        donors.push(donor);

        this.transfer(msg.value);
        LogReceiveDonation(msg.sender, msg.value);
    }

    function withdrawBalance() external isAvailableWithdraw {
        require(msg.sender == ong);
        assert(balanceDonation > 0);
        statusDonation = StatusDonation.CLOSE;
        balanceDonation = 0;
        msg.sender.transfer(this.balance);
        LogWithdraw(msg.sender);
    }

}

