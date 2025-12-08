module.exports = function mapActividad(data) {
    return {
        _id: data._id,
        usuarioId: data.usuarioId,
        accion: data.accion,
        descripcion: data.descripcion,
        timestamp: data.timestamp,
        isDeleted: data.isDeleted
    };
};
