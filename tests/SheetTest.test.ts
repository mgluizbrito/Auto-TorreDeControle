import SheetsController from '../dist/controllers/SheetsController.js';

async function testGetDriverData() {
    const PLATE = "TPP3H57";

    console.log(`Buscando viagens da placa ${PLATE}...`);

    const trip = await SheetsController.getCurrentTransferByPlate(PLATE);
    console.log('Resultado da busca:', trip);
}

testGetDriverData();
