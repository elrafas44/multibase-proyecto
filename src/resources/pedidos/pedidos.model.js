module.exports = function mapPedido(data) {
    return {
        _id: data._id,
        usuarioId: data.usuarioId,
        productoId: data.productoId,
        cantidad: data.cantidad,
        total: data.total,
        creadoEn: data.creadoEn,
        actualizadoEn: data.actualizadoEn,
        isDeleted: data.isDeleted
    };
};
