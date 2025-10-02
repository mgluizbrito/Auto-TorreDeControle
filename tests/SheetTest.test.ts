import SheetsController from '../dist/controllers/SheetsController.js';

async function testGetDriverData() {
    const driverName = "ACASSIO ONORIO KANZLER";
    
    console.log(`Buscando dados do motorista: ${driverName}`);
    console.log('Resultado:', await SheetsController.getDriverData(driverName));
}

testGetDriverData();
