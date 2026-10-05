$(document).ready(function() {
    // Initialize DataTables
    $('#productosTable').DataTable();

    // Toggle the add product form
    $('#toggleFormBtn').click(function() {
        $('#newProductForm').toggle('slow', function() {
            $('#toggleFormBtn').text($('#newProductForm').is(':visible') ? 'Cancelar' : 'Agregar Producto');
        });
    });

    // Handle new product form submission
    $('#newProductForm').on('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);

        $.ajax({
            url: $(this).attr('action'),
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                Swal.fire('Producto Agregado!', 'El nuevo producto ha sido agregado exitosamente.', 'success')
                    .then(() => location.reload()); // Recargar para ver el nuevo producto
            },
            error: function(err) {
                Swal.fire('Error!', (err.responseJSON && err.responseJSON.message) || 'No se pudo agregar el producto.', 'error');
            }
        });
    });

    // Handle delete product
    $(document).on('click', '.delete-button', function(e) {
        e.preventDefault();
        const productId = $(this).data('id');
        
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminarlo'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '/almacen/productos/delete/' + productId,
                    method: 'DELETE',
                    success: function(response) {
                        if (response.success) {
                            Swal.fire('Eliminado!', 'El producto ha sido eliminado.', 'success')
                                .then(() => $('#producto-' + productId).remove()); // Elimina la fila de la tabla
                        } else {
                            Swal.fire('Error!', response.message || 'No se pudo eliminar el producto.', 'error');
                        }
                    },
                    error: function(err) {
                        Swal.fire('Error!', (err.responseJSON && err.responseJSON.message) || 'No se pudo eliminar el producto.', 'error');
                    }
                });
            }
        });
    });

    // Handle edit product form submission
// Handle edit product form submission
$(document).on('submit', 'form[id^="editForm"]', function(e) {
    e.preventDefault();
    const form = $(this);
    const formData = new FormData(this);

    $.ajax({
        url: form.attr('action'),
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            if (response.success) {
                Swal.fire('Actualizado!', 'El producto ha sido actualizado correctamente.', 'success')
                    .then(() => location.reload()); // Recargar para ver los cambios
            } else {
                Swal.fire('Error!', response.message || 'No se pudo actualizar el producto.', 'error');
            }
        },
        error: function(err) {
            Swal.fire('Error!', (err.responseJSON && err.responseJSON.message) || 'No se pudo actualizar el producto.', 'error');
        }
    });
});

});
