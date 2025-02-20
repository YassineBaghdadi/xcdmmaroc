const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 5000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

$(document).ready(() => {
  $.ajax({
    type: 'GET',
    url: '/Recrutement/getUsersList',
    dataType: 'json',
    success: function (response) {
      // console.log(response);

      let ops = `<option value="">Tous</option>`;
      response.forEach((e) => {
        ops += `<option value="${e.id}">${e.nme}</option>`;
      });
      $('#createdBy').html(ops);
    },
    error: function (xhr, status, error) {
      console.log(xhr.responseText);
    },
  });

  var getOffers = () => {
    const inputIds = ['createdBy', 'dte'];

    const jsonData = {};

    inputIds.forEach((id) => {
      const inputElement = document.getElementById(id);

      if (inputElement && inputElement.value) {
        jsonData[id] = inputElement.value;
      }
    });
    fetch('/Recrutement/getOffers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Error: ${response.statusText}`);
        }
      })
      .then((data) => {
        $('#offersTbleBdy').html(data);
        // console.log(data);
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });
  };

  getOffers();

  $('#filtrBtn').click(() => {
    getOffers();
    getOfrsFltr();
  });

  var getOfrsFltr = () => {
    const inputIds = ['createdBy', 'dte'];

    const jsonData = {};

    inputIds.forEach((id) => {
      const inputElement = document.getElementById(id);

      if (inputElement && inputElement.value) {
        jsonData[id] = inputElement.value;
      }
    });
    fetch('/Recrutement/getOfrsFltr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Error: ${response.statusText}`);
        }
      })
      .then((data) => {
        // console.log(data);
        let ttl = 0;
        data.forEach((e) => {
          ttl += e.c;
          let i = e.status;

          $(`#${i.replace(' ', '_')}`).html(e.c);
        });
        $('#Fttl').html(ttl);

        // $('#offersTbleBdy').html(data);
        // console.log(data);
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });
  };

  getOfrsFltr();
});
