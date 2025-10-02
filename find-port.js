const net = require('net');

function findAvailablePort(startPort, endPort) {
  return new Promise((resolve, reject) => {
    let port = startPort;

    function tryPort() {
      if (port > endPort) {
        reject(new Error(`No available ports in range ${startPort}-${endPort}`));
        return;
      }

      const server = net.createServer();

      server.listen(port, () => {
        server.once('close', () => {
          resolve(port);
        });
        server.close();
      });

      server.on('error', () => {
        port++;
        tryPort();
      });
    }

    tryPort();
  });
}

const portType = process.argv[2];
const range = portType === 'web' ? [3000, 3005] : [8080, 8085];

findAvailablePort(range[0], range[1])
  .then(port => {
    console.log(port);
    process.exit(0);
  })
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });
