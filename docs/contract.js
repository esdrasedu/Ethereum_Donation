window.addEventListener('load', function() {
  if (typeof web3 !== 'undefined') {
    window.web3 = new Web3(web3.currentProvider);
  } else {
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  startApp()
  $('#submit').on('click', () => donate())
  $('.close').on('click', () => {
    document.getElementById('postedMessage').classList.add('hidden')
  })
})

function startApp() {
  loadAccounts()
  loadContract()
  subscribeEvents()
}

function loadContract() {
   if (!web3.isConnected()) {
     console.error('CANT CONNECT TO METAMASK')
     $('#no-web3-modal').modal('show')
     return
  }

  var abiString = `
[{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"doadores","outputs":[{"name":"doador","type":"address"},{"name":"valor","type":"uint256"},{"name":"dataHora","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"abrirDoacoes","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"fecharDoacoes","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"ong","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"statusDoacao","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_ong","type":"address"}],"name":"informarOng","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"responsavel","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"sacarDoacoes","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"doador","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"LogDoacaoRecebida","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"dataHora","type":"uint256"}],"name":"LogSaqueEfetuado","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"doador","type":"address"}],"name":"LogOngInformada","type":"event"}]
`
  var abi = JSON.parse(abiString)
  var address = '0xF7Cfe829bDdD500457B02b32Cdfd6b8145B8A099'
  window.contract = web3.eth.contract(abi).at(address)

  $('#contractLink').html(address)
  $('#contractLink').attr('href', 'https://etherscan.io/address/'+address)
}

function loadAccounts() {
  setInterval(() => {
    populateAccounts(web3.eth.accounts);
  }, 100);
}

function populateAccounts(accounts) {
  var opts = accounts.reduce((acc, currentAccount) => {
    acc += `<option>${currentAccount}</option>`
    return acc
  }, "")
  document.getElementById('accounts_list').innerHTML = opts
  account = web3.eth.accounts[0] // set first account
}

function subscribeEvents() {
  contract.LogDoacaoRecebida((error, result) => {
    if(error) {
      return
    }
    var selectedAccount = document.getElementById('accounts_list').value
    if(result.args.doador == selectedAccount){
      document.getElementById('postedMessage').classList.remove('hidden')
      document.getElementById('dimmer').classList.remove('active')
    }
  })
}

function donate() {
  var selectedAccount = document.getElementById('accounts_list').value
  account = selectedAccount
  if (!selectedAccount) {
    console.error('no account selected');
    return
  }

  var valueInput = document.getElementById('valueInput').value
  web3.eth.sendTransaction({
    to: contract.address,
    value: web3.toWei(valueInput, 'ether'),
    from: selectedAccount
  }, function(error, result) {
    if (error) {
      console.error(error);
      return
    }

    $('#transactionMessage').removeClass('hidden')
    $('#transactionLink').html(result)
    $('#transactionLink').attr('href', 'https://etherscan.io/address/'+result)

    // UI Config
    document.getElementById('dimmer').classList.add('active')
  })
}
