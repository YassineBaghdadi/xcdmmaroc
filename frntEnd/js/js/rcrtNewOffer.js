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
  $.get('/getName', function (data) {
    $('#AjouterPar').attr('placeholder', data);
    // $('#RecrutementPour').html(data);
  }).fail(function () {
    console.error('Failed to fetch default image.');
  });
  $.get('/Recrutement/Nouvelle-Offer/getEnttiesList', function (data) {
    $('#RecrutementPar').html(data);
  }).fail(function () {
    console.error('Failed to fetch');
  });
  $.get('/Recrutement/Nouvelle-Offer/getClientsList', function (data) {
    $('#RecrutementPour').html(data);
  }).fail(function () {
    console.error('Failed to fetch');
  });
  $('#DateAjout').val(new Date().toISOString().split('T')[0]);

  var changeSelect = (id, value) => {
    $(`#${id}Div select`).val(value).change();
    $(`#${id}Div .nice-select`).find('.current').text(value);
    $(`#${id}Div .nice-select`).find('.option').removeClass('selected');
    $(`#${id}Div .nice-select`)
      .find(`.option[data-value="${value}"]`)
      .addClass('selected');
  };
  const params = new URLSearchParams(window.location.search);
  const of = params.get('Offer');
  if (of) {
    fetch(`/Recrutement/Nouvelle-Offer/getOfr?o=${of}`)
      .then((response) => {
        console.log(response);

        if (response.ok) {
          return response.json();
        } else if (response.status === 404) {
          const newUrl =
            window.location.protocol +
            '//' +
            window.location.host +
            window.location.pathname;
          window.history.replaceState({ path: newUrl }, '', newUrl);
          throw new Error('Offer not found');
        } else {
          throw new Error(`Error: ${response.statusText}`);
        }
      })
      .then((data) => {
        console.log(data);

        $('#DateAjout').val(new Date(data.dte).toISOString().split('T')[0]);

        $('#AjouterPar').val(data.createdBy);
        $('#Titre').val(data.nme);
        // $('#RecrutementPour').val(data.entity);
        console.log(data.entity);

        changeSelect(`RecrutementTpe`, data.rcrtTpe);
        changeSelect(`RecrutementPar`, data.rcrtPar);
        changeSelect(`RecrutementPour`, data.rcrtPour);
        // $('#TypeContrats').val(data.cntrTpe);
        changeSelect(`TypeContrats`, data.cntrTpe);
        changeSelect(`Modetravail`, data.wrkTpe);
        // $('#DatePub1').val(data.startDte);
        $('#DatePub1').val(new Date(data.dte).toISOString().split('T')[0]);
        // $('#DatePub2').val(data.endDte);
        $('#DatePub2').val(new Date(data.dte).toISOString().split('T')[0]);
        $('#StatutOffre').val(data.stts);
        // $('#fonctios').val(data.fonctions);
        changeSelect(`fonctios`, data.fonctions);
        // $('#Secteur').val(data.sector);
        changeSelect(`Secteur`, data.sector);
        // $('#place').val(data.place);
        changeSelect(`place`, data.place);
        $('#Ville').val(data.city);
        // $('#Salaire').val(data.salair);
        changeSelect(`Salaire`, data.salair);
        // $('#Typeformation').val(data.formation);
        changeSelect(`Typeformation`, data.formation);
        // $('#experience').val(data.expYrs);
        changeSelect(`experience`, data.expYrs);
        $('#etude').val(data.etudLevel);
        changeSelect(`etude`, data.etudLevel);
        $('#Entreprise').val(data.cmpny);
        $('#Poste').val(data.post);
        $('#missions').val(data.missions);
        $('#Profil').val(data.prfile);
      })
      .catch((error) => {
        console.error(error);
        if (error.message === 'Offer not found') {
          Toast.fire({
            icon: 'error',
            title: "L'offre demandée n'a pas été trouvée.",
          });
        } else {
          console.error('Error:', error.message);
        }
      });
  }

  $('#sveJbOfrBTN').click(() => {
    if (
      $('#Titre').val() &&
      $('#TypeContrats').val() &&
      $('#DatePub1').val() &&
      $('#DatePub2').val() &&
      $('#StatutOffre').val() &&
      $('#fonctios').val() &&
      $('#Poste').val() &&
      $('#Profil').val()
    ) {
      $('#sveJbOfrBTN').attr('hidden', true);

      const formData = {
        Titre: $('#Titre').val(),
        rcrtTpe: $('#RecrutementTpe').val(),
        rcrtPar: $('#RecrutementPar').val(),
        rcrtPour: $('#RecrutementPour').val(),
        TypeContrat: $('#TypeContrats').val(),
        wrkTpe: $('#Modetravail').val(),
        DatePub1: $('#DatePub1').val(),
        DatePub2: $('#DatePub2').val(),
        StatutOffre: $('#StatutOffre').val(),
        fonctios: $('#fonctios').val(),
        Secteur: $('#Secteur').val(),
        Emplacement: $('#place').val(),
        Ville: $('#Ville').val(),
        Salaire: $('#Salaire').val(),
        Typeformation: $('#Typeformation').val(),
        experience: $('#experience').val(),
        etude: $('#etude').val(),
        Entreprise: $('#Entreprise').val(),
        Poste: $('#Poste').val(),
        missions: $('#missions').val(),
        Profil: $('#Profil').val(),
      };

      if (of) {
        formData['upt'] = of;
      }

      fetch('/Recrutement/Nouvelle-Offer/saveJobOffer ', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Error: ${response.statusText}`);
          }
        })
        .then((data) => {
          var txt = `les modifications sont enregistrées avec succès`;
          if (!of) {
            $('#Titre').val('');
            $('#rcrtTpe').val('');
            $('#rcrtPar').val('');
            $('#rcrtPour').val('');
            $('#cntrTpe').val('');
            $('#TypeContrats').val('');
            $('#Modetravail').val('');

            $('#DatePub1').val('');
            $('#DatePub2').val('');
            $('#StatutOffre').val('');
            $('#fonctios').val('');
            $('#Secteur').val('');
            $('#place').val('');
            $('#Ville').val('');
            $('#Salaire').val('');
            $('#Typeformation').val('');
            $('#experience').val('');
            $('#etude').val('');
            $('#Entreprise').val('');
            $('#Poste').val('');
            $('#missions').val('');
            $('#Profil').val('');
            $('#description').val('');
            txt = 'Nouvelle offre enregistrée avec succès';
          }

          Toast.fire({
            icon: 'success',
            title: txt,
          });
          $('#sveJbOfrBTN').removeAttr('hidden');
        })
        .catch((error) => {
          console.error('Error:', error.message);
        });
    } else {
      Toast.fire({
        icon: 'error',
        title: 'Veuillez remplir toutes les informations',
      });
    }
  });

  $('#RecrutementTpe').change(() => {
    console.log($('#RecrutementTpe').val() == 'Interne');
    if ($('#RecrutementTpe').val() == 'Interne') {
      $('#RecrutementPour').attr('disabled', true);
      changeSelect('RecrutementPour', '');
    } else {
      $('#RecrutementPour').removeAttr('disabled');
    }
  });
});
