const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../logs/failed_reassignments.log');

function logFailedReassignment({ idCaso, idNuevoFiscal, idUsuarioSolicitante, motivo }) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    idCaso,
    idNuevoFiscal,
    idUsuarioSolicitante,
    motivo
  };
  const line = JSON.stringify(logEntry) + '\n';
  fs.appendFileSync(LOG_FILE, line, { encoding: 'utf8' });
}

module.exports = { logFailedReassignment };
