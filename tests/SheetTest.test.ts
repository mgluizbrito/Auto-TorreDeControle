import { getDriverData } from '../dist/services/SheetsService.js';

async function testGetDriverData() {
    const driverName = "ACASSIO ONORIO KANZLER";
    
    console.log(`Buscando dados do motorista: ${driverName}`);
    console.log('Resultado:', await getDriverData(driverName));
}

testGetDriverData();
