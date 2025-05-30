// Script para debuggear la transformación de casos
// Simula la respuesta de la API para verificar que la transformación funciona

const casoAPI = {
    "IdCaso": 12,
    "NumeroCasoUnico": "EXP-TEST-20250530083517",
    "Descripcion": "Caso creado mediante script de pruebas automatizadas",
    "FechaCreacion": "2025-05-30T14:35:17.353Z",
    "FechaUltimaActualizacion": "2025-05-30T14:35:17.353Z",
    "IdEstadoCaso": 1,
    "NombreEstadoCaso": "Abierto",
    "DetalleProgreso": null,
    "IdFiscalAsignado": null,
    "FiscalPrimerNombre": null,
    "FiscalPrimerApellido": null,
    "FiscalNombreUsuario": null,
    "FiscalNombreFiscalia": null,
    "UsuarioCreacionNombreUsuario": "admin",
    "UsuarioModificacionNombreUsuario": "admin"
};

// Simula la función transformarCasoAPI
const transformarCasoAPI = (casoAPI) => {
  return {
    id: casoAPI.IdCaso,
    idCaso: casoAPI.IdCaso,
    numeroCaso: casoAPI.NumeroCasoUnico,
    numeroExpediente: casoAPI.NumeroCasoUnico,
    titulo: casoAPI.Titulo || casoAPI.Descripcion || '',
    descripcion: casoAPI.Descripcion || '',
    fechaCreacion: casoAPI.FechaCreacion,
    fechaAsignacion: casoAPI.FechaAsignacion,
    idEstado: casoAPI.IdEstadoCaso || 1,
    idFiscalAsignado: casoAPI.IdFiscalAsignado || undefined,
    idUsuarioCreador: casoAPI.IdUsuarioCreador || 0,
    fiscal: (casoAPI.FiscalPrimerNombre && casoAPI.FiscalPrimerApellido) ? {
      idFiscal: casoAPI.IdFiscalAsignado || 0,
      primerNombre: casoAPI.FiscalPrimerNombre,
      segundoNombre: '',
      primerApellido: casoAPI.FiscalPrimerApellido,
      segundoApellido: '',
      nombres: `${casoAPI.FiscalPrimerNombre}`,
      apellidos: casoAPI.FiscalPrimerApellido,
      activo: true,
    } : undefined,
  };
};

console.log('Datos originales de la API:');
console.log(JSON.stringify(casoAPI, null, 2));

console.log('\nDatos transformados para el frontend:');
const casoTransformado = transformarCasoAPI(casoAPI);
console.log(JSON.stringify(casoTransformado, null, 2));

console.log('\nCampos claves verificados:');
console.log('- ID del caso:', casoTransformado.id);
console.log('- Número de caso:', casoTransformado.numeroCaso);
console.log('- Descripción:', casoTransformado.descripcion);
console.log('- Estado ID:', casoTransformado.idEstado);
console.log('- Fiscal asignado:', casoTransformado.idFiscalAsignado);
console.log('- Fecha creación:', casoTransformado.fechaCreacion);
