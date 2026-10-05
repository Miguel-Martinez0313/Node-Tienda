$(document).ready(function () {
  $('#descuentosTable').DataTable();

  // Mostrar/ocultar el formulario de agregar descuento
  $('#toggleFormBtn').click(function () {
    $('#addDiscountForm').toggle('slow');
  });

  // Enviar el formulario para agregar un nuevo descuento
  $('#newDiscountForm').on('submit', function (e) {
    e.preventDefault();
    const formData = $(this).serialize();

    $.ajax({
      url: '/ofertas/descuentos', // Ajusta esta URL según tu configuración de servidor
      method: 'POST',
      data: formData,
      success: function (response) {
        Swal.fire('Agregado!', 'El descuento ha sido agregado exitosamente.', 'success').then(() => {
          window.location.href = '/ofertas/descuentos'; // Redirige a la lista actualizada
        });
      },
      error: function (err) {
        Swal.fire('Error!', (err.responseJSON && err.responseJSON.message) || 'No se pudo agregar el descuento.', 'error');
      }
    });
  });

  // Cargar datos en el modal para editar descuento
  $(document).ready(function () {
    // Mostrar datos en el modal de edición
    $('.edit-button').click(function () {
      const id = $(this).data('id');
      const row = $(this).closest('tr');
      const descuento = row.find('td:eq(1)').text();
      const descripcion = row.find('td:eq(2)').text();
      const fechaInicio = row.find('td:eq(3)').text();
      const fechaFin = row.find('td:eq(4)').text();
  
      // Rellena el modal con los datos del descuento
      $('#editId').val(id);
      $('#editDescuento').val(descuento);
      $('#editDescripcion').val(descripcion);
      $('#editFechaInicio').val(fechaInicio.replace(' ', 'T'));
      $('#editFechaFin').val(fechaFin.replace(' ', 'T'));
  
      // Muestra el modal
      $('#editModal').modal('show');
    });
  
    // Enviar los datos del formulario de edición
    $('#editDiscountForm').on('submit', function (e) {
      e.preventDefault();
  
      const id = $('#editId').val();
      const formData = $(this).serialize();
  
      $.ajax({
        url: '/ofertas/descuentos/' + id,
        method: 'PUT',
        data: formData,
        success: function (response) {
          Swal.fire('Actualizado!', 'El descuento ha sido actualizado correctamente.', 'success').then(() => {
            window.location.reload();
          });
        },
        error: function (err) {
          Swal.fire('Error!', (err.responseJSON && err.responseJSON.message) || 'No se pudo actualizar el descuento.', 'error');
        }
      });
    });
  });
  

  // Eliminar un descuento
  $('.delete-button').click(function () {
    const discountId = $(this).data('id');
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
          url: '/ofertas/descuentos/' + discountId,
          method: 'DELETE',
          success: function (response) {
            Swal.fire('Eliminado!', response.message, 'success').then(() => {
              // Elimina la fila de la tabla sin recargar la página
              $('#descuento-' + discountId).remove();
            });
          },
          error: function (err) {
            Swal.fire('Error!', (err.responseJSON && err.responseJSON.message) || 'No se pudo eliminar el descuento.', 'error');
          }
        });
      }
    });
  });
});
