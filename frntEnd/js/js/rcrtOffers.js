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
  $.get('/ERP/Recrutement/Nouvelle-Offer/getEnttiesList', function (data) {
    $('#entity').html(data);
  }).fail(function () {
    console.error('Failed to fetch default image.');
  });

  var getOffers = () => {
    const inputIds = [
      'entity',
      'stts',
      'fonctions',
      'place',
      'salair',
      'formation',
      'sector',
      'expYrs',
      'etudLevel',
      'dte',
      'startDte',
      'endDte',
      'cleF',
    ];

    const jsonData = {};

    inputIds.forEach((id) => {
      const inputElement = document.getElementById(id);

      if (inputElement && inputElement.value) {
        jsonData[id] = inputElement.value;
      }
    });
    fetch('/ERP/Recrutement/Les-offres/getOffers', {
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

        if (!data.access) {
          $(`#addNewOffrBtn`).attr('hidden', true);
        }
        $('#offersTbleBdy').html(data.t);
        // console.log(data);
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });
  };

  getOffers();

  var openQlfWnd = (e) => {
    Swal.fire({
      title: 'Submit your Github username',
      input: 'select',
      inputOptions: {
        0: 'Accépter Pour Le poste',
        1: 'Accépter Pour un entretien physique',
        2: 'Injoignable',
        3: 'Déja Accépter pour une autre offre',
        4: 'Hors Cible',
        5: 'Refuser',
      },
      showCancelButton: true,
      confirmButtonText: 'Look up',
      showLoaderOnConfirm: true,
      preConfirm: async (qlf) => {
        alert(qlf);
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  };

  var getOfrCnds = (e) => {
    let url = `/ERP/Recrutement/Les-offres/getOffresApllies/${$(
      e.relatedTarget
    ).data('id')}`;
    let qrs = [];

    if ($('#qlfSelect').val()) {
      qrs.push(`s=${$('#qlfSelect').val()}`);
    }

    if ($('#Date_Candidature').val()) {
      qrs.push(`d=${$('#Date_Candidature').val()}`);
    }

    url += qrs.length ? '?' + qrs.join('&') : '';

    $.ajax({
      url: url,
      method: 'GET',
      success: async function (data) {
        var ap = data.ap;
        var tbl = '';
        // console.log(data);
        $('#ofID').html($(e.relatedTarget).data('id'));

        ap.forEach((e) => {
          tbl += `
           <tr>
                               <td class="text-center">${e.dte
                                 .split('.')[0]
                                 .replace('T', ' ')}</td>
                               <td class="text-center">
                                 <a href="/Recrutement/Candidats/${e.uniqID}">${
            e.cndNme
          }</a>
                               </td>
                               <td class="text-center">${e.qlf}</td>
                               <td class="text-center">${e.qlfBy}</td>
                               <td class="text-center">${e.qlfDte}</td>
                               
                             </tr>
         `;
        });
        $('#modalRequestLabel').text(
          `Liste Candidatures de l'offre ${data.of}`
        );
        $('#popUpTblBdy').html(tbl);

        // $(this).find('#modalRequestLabel').html(`Liste Candidatures de  ${data.of}`);
      },
      error: function (error) {
        $('#modalContent').text('Error loading data.');
      },
    });
  };

  $('#Candidatures').on('show.bs.modal', function (event) {
    // $(this).find('#modalRequestLabel').text($(event.relatedTarget).data('id'));
    getOfrCnds(event);
    // $('#qlfBtn').click(() => {
    //   getOfrCnds(event);
    // });
    $('.cndFltr').click(() => {
      getOfrCnds(event);
    });
  });

  $('#Fbtn').click(() => {
    getOffers();
  });

  $('#qlfBtn').click(() => {
    $.ajax({
      url: '/ERP/Recrutement/Les-offres/qlfCnd',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ q: $('#qlfSelect').val(), i: $('#ofID').html() }),
      success: function (response) {
        $('#clsBtn').click();
      },
      error: function (xhr, status, error) {
        // Handle errors
        console.error('Error:', error);
      },
    });
  });
  document.getElementB;
});
