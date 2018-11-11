function ingredients(req, res) {
  console.log("GET From SERVER");
  (async () => {
      try{
        const result = await api.transact({
          actions: [{
            account: 'eosio.token',
            name: 'transfer',
            authorization: [{
              actor: 'chuck',
              permission: 'active',
            }],
            data: {
              from: 'chuck',
              to: 'alice',
              quantity: '0.0001 CM',
              memo: '',
            },
          }]
        }, {
          blocksBehind: 3,
          expireSeconds: 30,
        });
        console.log(result);
      } catch (e) {
        console.log('\nCaught exception: ' + e);
        if (e instanceof RpcError)
          console.log(JSON.stringify(e.json, null, 2));
      }

  })();

  res.send("hi");
}