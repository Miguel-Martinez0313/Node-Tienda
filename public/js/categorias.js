$(document).ready(function() {
  $('#categoriasTable').DataTable();

  $('#toggleFormBtn').click(function() {
    $('#addCategoryForm').toggle('slow');
  });

  $('#newCategoryForm').on('submit', function(e) {
    e.preventDefault();
    const formData = $(this).serialize();

    $.ajax({
      url: '/lista/categoria/add', // Ajusta esta URL según tu configuración de servidor
      method: 'POST',
      data: formData,
      success: function(response) {
        Swal.fire('Agregada!', 'La categoría ha sido agregada exitosamente.', 'success').then(() => {
          location.reload();
        });
      },
      error: function(err) {
        Swal.fire('Error!', (err.responseJSON && err.responseJSON.message) || 'No se pudo agregar la categoría.', 'error');
      }
    });
  });

  $('.edit-button').click(function() {
    var $row = $(this).closest('tr');
    var id = $(this).data('id');
    var nombre = $row.find('td:eq(1)').text();
    var descripcion = $row.find('td:eq(2)').text();

    $('#editId').val(id);
    $('#editNombre').val(nombre);
    $('#editDescripcion').val(descripcion);
    $('#editCategoryModal').modal('show');
  });

  $(document).on('submit', '#editCategoryForm', function(e) {
    e.preventDefault();
    const form = $(this);
    const formData = form.serialize();

    $.ajax({
      url: '/lista/categoria/edit/' + $('#editId').val(), // Ajusta esta URL según tu configuración de servidor
      method: 'POST',
      data: formData,
      success: function(response) {
        Swal.fire('Actualizada!', 'La categoría ha sido actualizada correctamente.', 'success').then(() => {
          $('#editCategoryModal').modal('hide');
          location.reload();
        });
      },
      error: function(err) {
        Swal.fire('Error!', (err.responseJSON && err.responseJSON.message) || 'No se pudo actualizar la categoría.', 'error');
      }
    });
  });

  $('.delete-button').click(function() {
    var categoryId = $(this).data('id');
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
          url: '/lista/categoria/delete/' + categoryId,
          method: 'DELETE',
          success: function(response) {
            Swal.fire('Eliminada!', 'La categoría ha sido eliminada.', 'success').then(() => {
              location.reload();
            });
          },
          error: function(err) {
            Swal.fire('Error!', (err.responseJSON && err.responseJSON.message) || 'No se pudo eliminar la categoría.', 'error');
          }
        });
      }
    });
  });
});
