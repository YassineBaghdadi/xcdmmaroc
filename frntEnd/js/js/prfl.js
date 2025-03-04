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

var underCnstrct = `<div style="display: flex; justify-content: center; align-items: center; height: 50vh; width: 100%;"><h1 style='font-size: 4rem;font-family: "Poiret One", cursive;margin-bottom: .5rem;color:red;' class="title">under construction</h1></div>
`;

$(document).ready(function () {
  // $('#Deplacement').html(underCnstrct)
  // $('#Recuperation').html(underCnstrct)
  $('#DemandeRec').html(underCnstrct);

  function getUsrData() {
    fetch('/ERP/Profile/getUsDt')
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error(data.error);
        } else {
          // console.log(data);
          $('#userFullName').html(data.data.fname + ' ' + data.data.lname);

          // document.getElementById("prflPic").src = imageUrl;
          if (window.location.pathname == '/ERP/Profile/') {
            document.getElementById(
              'thePic'
            ).src = `./rcs/ProfilePics/${data.data.id}.${data.data.picExt}`;

            $('#NomP').val(data.data.lname);
            $('#Prenom').val(data.data.fname);

            $('#Naissance').val(data.data.bd.split('T')[0]);
            $('#e-Mail').val(data.data.email);
            $('#address').val(data.data.adress);
            $('#usrNme').val(data.data.usrNme);
            $('#Telephone').val(data.data.phone);
            $('#Portable').val(data.data.phone2);
            $('#Entite').val(data.data.actualEntity);
            $('#Contrat').val(data.data.contractTpe);
            $('#integration').val(data.data.integrationDate.split('T')[0]);
            $('#Fonction').val(data.data.jobeTitle);
            3;

            // if(data.onGoing > 0){
            //   $("#cnjInputsDiv").html(`<div class="centered-text"> Vous ne pouvez pas faire une nouvelle demande de congé </div>`);
            //   // document.getElementById("cnjInputsDiv").style.display = "none";
            // }
            // $("#cnjTbleBdy").html(data.cnj);
            // $("#soldConge").html(data.Scnj);
          }
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  function getCnjDt() {
    fetch('/getUsrCnjTbl')
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error(data.error);
        } else {
          // console.log(data);
          $('#cnjTbleBdy').html(data.cnj);
          $('#soldConge').html(data.sc);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  function getDCSrqstDt() {
    fetch('/ERP/Profile/getDCSrqstDt')
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error(data.error);
        } else {
          $('#DCSrqsttbl').html(data);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  function getDechargesTble() {
    fetch('/ERP/Profile/getDechargesTble')
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error(data.error);
        } else {
          $('#dchrgesTbl').html(data.d);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  function getDplcmTble() {
    fetch('/ERP/Profile/getDplcmTble')
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error(data.error);
        } else {
          $('#dplcmTbl').html(data.d);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  function getRecupTble() {
    fetch('/ERP/Profile/getRecupTble')
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error(data.error);
        } else {
          $('#recupTble').html(data.d);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  function getReclmTble() {
    fetch('/ERP/Profile/getReclmTble')
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error(data.error);
        } else {
          $('#reclmTbl').html(data.d);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  let daysCount = (s, e) => {
    if (s && e) {
      var start = new Date(s);
      var end = new Date(e);

      var excludedWeekdays = [0, 6];
      if (
        excludedWeekdays.includes(start.getDay()) ||
        excludedWeekdays.includes(end.getDay())
      ) {
        Toast.fire({
          icon: 'error',
          title: 'Vous ne pouvez pas choisir les week-ends.',
        });
        $('#EndDay').val('');
        return '00';
      }
      var holidayDates = [
        '01/01',
        '11/01',
        '01/05',
        '30/07',
        '14/08',
        '20/08',
        '21/08',
        '06/11',
        '18/11',
      ].map(function (holiday) {
        var parts = holiday.split('/');
        var holidayDate = new Date(parts[2], parts[1] - 1, parts[0]);
        return holidayDate;
      });
      var count = 0;
      var currentDate = start;

      while (currentDate <= end) {
        var dayOfWeek = currentDate.getDay();
        var isWeekend = excludedWeekdays.includes(dayOfWeek);
        var isHoliday = holidayDates.some(function (holiday) {
          return (
            holiday.getDate() === currentDate.getDate() &&
            holiday.getMonth() === currentDate.getMonth()
          );
        });

        if (!isWeekend && !isHoliday) {
          count++;
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (count > $('#soldConge').html() && $('#cnjTpe').val() == 1) {
        Toast.fire({
          icon: 'error',
          title: `il ne vous reste que ${$(
            '#soldConge'
          ).html()} jours sur le compte conji`,
        });
        $('#EndDay').val('');
        return '00';
      } else {
        return count;
      }
    } else {
      return '00';
    }
  };

  let today = new Date();
  today.setDate(today.getDate() + 1);
  let year = today.getFullYear();
  let month = String(today.getMonth() + 1).padStart(2, '0');
  let day = String(today.getDate()).padStart(2, '0');
  $('#StartDay').attr('min', `${year}-${month}-${day}`);
  // Get the current date and time
  let now = new Date();
  // Add 1 hour to the current date and time
  var maxDateTime = new Date(now.getTime() + 60 * 60 * 1000);
  let yr = maxDateTime.getFullYear();
  let mnth = String(maxDateTime.getMonth() + 1).padStart(2, '0');
  let dy = String(maxDateTime.getDate()).padStart(2, '0');
  // Format the date and time to be compatible with datetime-local input

  var hours = ('0' + maxDateTime.getHours()).slice(-2);
  var minutes = ('0' + maxDateTime.getMinutes()).slice(-2);
  var maxDateTimeString =
    yr + '-' + mnth + '-' + dy + 'T' + hours + ':' + minutes;
  var maxDateString = yr + '-' + mnth + '-' + dy;
  // Set the max attribute of the datetime-local input
  $('#Datesortie').attr('min', maxDateTimeString);
  $('#Datedereprise').attr('min', maxDateTimeString);
  $('#Datesortie').on('change', () => {
    $('#Datedereprise').val('');
    if ($('#Datesortie').val()) {
      $('#Datedereprise').attr('min', $('#Datesortie').val());
    } else {
      $('#Datesortie').attr('min', maxDateTimeString);
      $('#Datedereprise').attr('min', maxDateTimeString);
    }
  });

  $('#dplcmD1').attr('min', maxDateTimeString);
  $('#dplcmD2').attr('min', maxDateTimeString);
  $('#dplcmD1').on('change', () => {
    $('#dplcmD2').val('');
    if ($('#dplcmD1').val()) {
      $('#dplcmD2').attr('min', $('#dplcmD1').val());
    } else {
      $('#dplcmD1').attr('min', maxDateTimeString);
      $('#dplcmD2').attr('min', maxDateTimeString);
    }
  });

  $('#recupD1').attr('min', maxDateString);
  $('#recupD2').attr('min', maxDateString);
  $('#recupD1').on('change', () => {
    $('#recupD2').val('');
    if ($('#recupD1').val()) {
      $('#recupD2').attr('min', $('#recupD1').val());
    } else {
      $('#recupD1').attr('min', maxDateString);
      $('#recupD2').attr('min', maxDateString);
    }
  });
  getUsrData();
  getDCSrqstDt();
  getDechargesTble();
  getDplcmTble();
  getRecupTble();
  getReclmTble();
  // $("#Motdepasse").on("input", function () {
  //   if ($("#Motdepasse").val().length < 8) {
  //     $("#psswerr1").html(
  //       "Erreur : Le mot de passe doit comporter 8 caractères ou plus."
  //     );
  //     $("#mdfInfoBtn").attr("disabled", "disabled");
  //     if ($("#Motdepasse").val() != $("#ConfirmationMotdepasse").val()) {
  //       $("#psswerr2").html(
  //         "Erreur : Les mots de passe fournis ne correspondent pas."
  //       );
  //     } else {
  //       $("#psswerr2").html("");
  //     }
  //   } else {
  //     if ($("#Motdepasse").val() != $("#ConfirmationMotdepasse").val()) {
  //       $("#psswerr2").html(
  //         "Erreur : Les mots de passe fournis ne correspondent pas."
  //       );
  //     } else {
  //       $("#psswerr2").html("");
  //       $("#mdfInfoBtn").removeAttr("disabled");
  //     }

  //     $("#psswerr1").html("");
  //   }
  // });

  $('#ConfirmationMotdepasse').on('input', function () {
    if ($('#Motdepasse').val() != $('#ConfirmationMotdepasse').val()) {
      $('#psswerr2').html(
        'Erreur : Les mots de passe fournis ne correspondent pas.'
      );
      $('#mdfInfoBtn').attr('disabled', 'disabled');
    } else {
      if ($('#Motdepasse').val().length >= 8) {
        $('#mdfInfoBtn').removeAttr('disabled');
      }

      $('#psswerr2').html('');
    }
  });

  $('#mdfInfoBtn').click(function () {
    fetch('/ERP/Profile/modifyInfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addr: $('#address').val(),
        eml: $('#e-Mail').val(),
        tel: $('#Telephone').val(),
        tel2: $('#Portable').val(),
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('save failed');
        }
      })
      .then((data) => {
        getUsrData();

        Toast.fire({
          icon: 'success',
          title: 'Vos données personnelles ont été mises à jour avec succès',
        });
      })
      .catch((error) => {
        console.error(' Error:', error);
      });
  });

  $('#rstPswdBtn').click(async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Réinitialisation du Mot de Passe',
      html: `
    <input id="pssInp" type="password" placeholder="Écrivez le mot de passe" >
    <input id="pssInp2" type="password" placeholder="Confirmez le mot de passe" >
  `,
      showCancelButton: true,
      showLoaderOnConfirm: true,
      focusConfirm: false,
      preConfirm: () => {
        let resultObject = {
          input1: document.getElementById('pssInp').value,
          input2: document.getElementById('pssInp2').value,
        };
        if (
          !resultObject.input1 ||
          !resultObject.input2 ||
          resultObject.input1 !== resultObject.input2 ||
          resultObject.input1.length < 8
        ) {
          Swal.fire({
            title: 'Mot de passe non autorisé. Veuillez réessayer',
            icon: 'error',
          });
          return null;
        }
        return resultObject;
      },
    });
    if (formValues) {
      $.ajax({
        url: '/ERP/Profile/resetPawd',
        method: 'POST',
        data: {
          p: formValues.input1,
        },
        success: function (response) {
          Toast.fire({
            icon: 'success',
            title: 'Le mot de passe a été réinitialisé avec succès',
          });
        },
        error: function (xhr, status, error) {
          console.error('Error:', error);
          Toast.fire({
            icon: 'error',
            title: "erreur : l'opération a échoué.",
          });
        },
      });
    }
  });

  $('#addPicBtn').click(function () {
    $('#prflPicInput').click();
  });

  $('#addCnjProofBtn').click(function () {
    $('#prflCnjProofInput').click();
  });

  $('#cnjTpe').on('change', function () {
    $('#StartDay').val('');
    $('#EndDay').val('');
    $('#StartDay').removeAttr('disabled');
    if ($(this).val() < 3) {
      $('#JoursCong').val('00');
      $('#EndDay').removeAttr('disabled');
      $('#cnjProof').attr('hidden', 'hidden');
      $('#cnjProofTxt').attr('hidden', 'hidden');
    } else {
      $('#JoursCong').val('02');
      if ($(this).val() == 3) {
        $('#JoursCong').val('90');
      } else if ($(this).val() == 5) {
        $('#JoursCong').val('04');
      } else if ($(this).val() == 9) {
        $('#JoursCong').val('03');
      }

      $('#EndDay').attr('disabled', 'disabled');
      $('#cnjProof').removeAttr('hidden');
      $('#cnjProofTxt').removeAttr('hidden');
    }
  });

  $('#StartDay').on('change', function () {
    let chosenD = new Date($(this).val());
    if (chosenD.getDay() === 0 || chosenD.getDay() === 6) {
      Toast.fire({
        icon: 'error',
        title: 'Vous ne pouvez pas choisir les week-ends.',
      });
      $(this).val('');
      return;
    }
    let ed = new Date($('#EndDay').val());
    if (chosenD > ed) {
      $('#EndDay').val('');
    }

    let strtD = new Date($(this).val());
    let year = strtD.getFullYear();
    let month = String(strtD.getMonth() + 1).padStart(2, '0');
    let day = String(strtD.getDate()).padStart(2, '0');
    $('#EndDay').attr('min', `${year}-${month}-${day}`);

    if ($('#cnjTpe').val() >= 3) {
      var daysToAdd = 0;

      if ($('#cnjTpe').val() == 3) {
        const parsedStartDate = new Date($(this).val());
        const endDate = new Date(
          parsedStartDate.getTime() + 90 * 24 * 60 * 60 * 1000
        );
        $('#EndDay').val(
          `${endDate.getFullYear()}-${(endDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`
        );
      } else {
        const holidays = [
          '01/01',
          '11/01',
          '01/05',
          '30/07',
          '14/08',
          '20/08',
          '21/08',
          '06/11',
          '18/11',
        ];
        if (['4', '6', '7', '8'].includes($('#cnjTpe').val())) {
          daysToAdd = 1;
        } else if ($('#cnjTpe').val() == 5) {
          daysToAdd = 3;
        } else if ($('#cnjTpe').val() == 9) {
          daysToAdd = 2;
        }

        let currentDate = new Date($(this).val());
        while (daysToAdd > 0) {
          console.log(`${currentDate.getDay()}`);
          if (
            currentDate.getDay() === 0 ||
            currentDate.getDay() === 6 ||
            holidays.includes(
              `${currentDate.getDate()}/${currentDate.getMonth() + 1}`
            )
          ) {
            continue;
          }
          if (currentDate.getDay() === 5) {
            currentDate.setDate(currentDate.getDate() + 3);
          } else {
            currentDate.setDate(currentDate.getDate() + 1);
          }

          daysToAdd--;
        }
        $('#EndDay').val(
          `${`${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${currentDate
            .getDate()
            .toString()
            .padStart(2, '0')}`}`
        );
      }
    } else {
      $('#JoursCong').val(daysCount($('#StartDay').val(), $('#EndDay').val()));
    }
  });

  $('#EndDay').on('change', () => {
    if ($('#cnjTpe').val() < 3) {
      $('#JoursCong').val(daysCount($('#StartDay').val(), $('#EndDay').val()));
    } else {
      $('#JoursCong').val('00');
    }
  });

  $('#prflPicInput').on('change', async function () {
    const formData = new FormData();
    await formData.append('prflPc', $('#prflPicInput')[0].files[0]);

    // try {

    $.ajax({
      type: 'POST',
      url: '/uploadPrflPic',
      data: formData,
      contentType: false,
      processData: false,
      success: function (response) {
        Toast.fire({
          icon: 'success',
          title: 'La Photo a été ajoutée avec succès',
        });
        getUsrData();
      },
      error: function (error) {
        Toast.fire({
          icon: 'error',
          title: "L'opération a échoué, veuillez contacter l'administration",
        });
        console.error(error);
      },
    });

    // } catch (error) {
    //   console.error("Error:", error);
    // }
  });
  getCnjDt();
  $('#saveCnjBtn').click(function () {
    if (
      $('#JoursCong').val() == '00' ||
      ($('#cnjTpe').val() > 2 && !$('#prflCnjProofInput')[0].files[0])
    ) {
      Toast.fire({
        icon: 'error',
        title: 'Veuillez remplir toutes les entrées',
      });
    } else {
      const formData = new FormData();
      formData.append('ctpe', $('#cnjTpe option:selected').text());
      formData.append('sd', $('#StartDay').val());
      formData.append('ed', $('#EndDay').val());
      formData.append('cout', $('#JoursCong').val());
      formData.append('prflCnjProofInput', $('#prflCnjProofInput')[0].files[0]);

      $.ajax({
        type: 'POST',
        url: '/ERP/Profile/sveCnj',
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
          console.log(response);
          getCnjDt();
          if (response.message == 'DONE') {
            $('#cnjTpe').val('');
            $('#StartDay').val('');
            $('#EndDay').val('');
            $('#JoursCong').val('00');
            Toast.fire({
              icon: 'success',
              title: 'votre demande a été enregistrée.',
            });
          } else if (response.message == 'no') {
            $('#cnjTpe').val('');
            $('#StartDay').val('');
            $('#EndDay').val('');
            $('#JoursCong').val('00');
            Toast.fire({
              icon: 'error',
              title:
                'vous avez déjà une demande active qui chevauche celle-ci.',
            });
          } else {
            Toast.fire({
              icon: 'error',
              title: "l'opération a échoué",
            });
          }
        },
        error: function (error) {
          console.error(error);
        },
      });
    }
  });

  $('#DCsRqstBtn').click(() => {
    if (
      $('#dat').prop('checked') ||
      $('#das').prop('checked') ||
      $('#dds').prop('checked') ||
      $('#dbp').prop('checked') ||
      $('#dbc').prop('checked') ||
      $('#dct').prop('checked')
    ) {
      var DCLst = [];

      if ($('#dat').prop('checked')) {
        DCLst.push('Attestation de travail');
      }
      if ($('#das').prop('checked')) {
        DCLst.push('Attestation de salaire');
      }
      if ($('#dds').prop('checked')) {
        DCLst.push('Domiciliation de salaire');
      }
      if ($('#dbp').prop('checked')) {
        DCLst.push('Bulletin(s) de paie');
      }
      if ($('#dbc').prop('checked')) {
        DCLst.push('Bordereaux CNSS');
      }
      if ($('#dct').prop('checked')) {
        DCLst.push('Certificat de travail');
      }

      var DCs = DCLst.join(', ');
      // console.log({ dcs: DCs, msg: $("#DCsRMessage").val() });

      fetch('/ERP/Profile/sveDCSrqst', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dcs: DCs, msg: $('#DCsRMessage').val() }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Error: ${response.statusText}`);
          }
        })
        .then((data) => {
          if (data.message == 'DONE') {
            $('#dat').prop('checked', false);
            $('#das').prop('checked', false);
            $('#dds').prop('checked', false);
            $('#dbp').prop('checked', false);
            $('#dbc').prop('checked', false);
            $('#dct').prop('checked', false);
            $('#DCsRMessage').val('');
            getDCSrqstDt();
            Toast.fire({
              icon: 'success',
              title: 'La demande a été envoyée.',
            });
          } else {
            Toast.fire({
              icon: 'error',
              title: "l'opération a échoué",
            });
          }
        })
        .catch((error) => {
          console.error('Error:', error.message);
        });
    } else {
      Toast.fire({
        icon: 'error',
        title: "Veuillez d'abord choisir des documents.",
      });
    }
  });

  $('#DCSrqsttbl').on('click', 'button', function () {
    if (confirm('Es-tu sûr de vouloir annuler cette demande?')) {
      fetch('/ERP/Profile/cnclDcsRqst', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ i: $(this).data('id') }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Error: ${response.statusText}`);
          }
        })
        .then((data) => {
          if (data.message == 'DONE') {
            getDCSrqstDt();
          } else {
            Toast.fire({
              icon: 'error',
              title: "l'opération a échoué",
            });
          }
        })
        .catch((error) => {
          console.error('Error:', error.message);
        });
    }
  });

  $('#saveDchrgeBtn').click(function () {
    if (
      $('#dchrgeRsn').val() &&
      $('#Datesortie').val() &&
      $('#Datedereprise').val() &&
      $('#passe').val() &&
      $('#DchrgeMessage').val()
    ) {
      $('#saveDchrgeBtn').html('<i class="fa fa-spinner fa-spin"></i> ');
      $('#saveDchrgeBtn').attr('disabled', 'disabled');
      fetch('/ERP/Profile/saveDchrge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rsn: $('#dchrgeRsn').val(),
          d1: $('#Datesortie').val(),
          d2: $('#Datedereprise').val(),
          ps: $('#passe').val(),
          msg: $('#DchrgeMessage').val(),
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Error: ${response.statusText}`);
          }
        })
        .then((data) => {
          if (data.message == 'DONE') {
            $('#dchrgeRsn').val('');
            $('#Datesortie').val('');
            $('#Datedereprise').val('');
            $('#passe').val('');
            $('#DchrgeMessage').val('');
            $('#chckDchrge').prop('checked', false);
            getDechargesTble();
          } else if (data.message == 'p') {
            Toast.fire({
              icon: 'error',
              title: 'Mot de passe incorrect',
            });
            $('#passe').select();
            $('#passe').focus();
          } else {
            Toast.fire({
              icon: 'error',
              title: "l'opération a échoué",
            });
          }
          $('#saveDchrgeBtn').html('Envoyée');
          $('#saveDchrgeBtn').removeAttr('disabled');
        })
        .catch((error) => {
          console.error('Error:', error.message);
        });
    } else {
      Toast.fire({
        icon: 'error',
        title: 'Veuillez remplir tous les champs.',
      });
    }
  });

  $('#chckDchrge').on('change', () => {
    if ($('#chckDchrge').prop('checked')) {
      $('#saveDchrgeBtn').removeAttr('disabled');
    } else {
      $('#saveDchrgeBtn').attr('disabled', 'disabled');
    }
  });

  $('#sveDplcmReqBtn').click(function () {
    if (
      $('#dplcmRsn').val() &&
      $('#trnsprtTpe').val() &&
      $('#dplcmD1').val() &&
      $('#dplcmD2').val() &&
      $('#dpcmDlgtion').val() &&
      $('#dplcmPaass').val() &&
      $('#dplcmNotes').val()
    ) {
      fetch('/ERP/Profile/sveDplcmReq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rsn: $('#dplcmRsn').val(),
          trsp: $('#trnsprtTpe').val(),
          d1: $('#dplcmD1').val(),
          d2: $('#dplcmD2').val(),
          dlg: $('#dpcmDlgtion').val(),
          ps: $('#dplcmPaass').val(),
          msg: $('#dplcmNotes').val(),
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Error: ${response.statusText}`);
          }
        })
        .then((data) => {
          if (data.message == 'DONE') {
            $('#dplcmRsn').val('');
            $('#trnsprtTpe').val('');
            $('#dplcmD1').val('');
            $('#dplcmD2').val('');
            $('#dpcmDlgtion').val('');
            $('#dplcmPaass').val('');
            $('#dplcmNotes').val('');
            getDplcmTble();
          } else if (data.message == 'p') {
            Toast.fire({
              icon: 'error',
              title: 'Mot de passe incorrect',
            });
            $('#dplcmPaass').select();
            $('#dplcmPaass').focus();
          } else {
            Toast.fire({
              icon: 'error',
              title: "l'opération a échoué",
            });
          }
        })
        .catch((error) => {
          console.error('Error:', error.message);
        });
    } else {
      Toast.fire({
        icon: 'error',
        title: 'Veuillez remplir tous les champs.',
      });
    }
  });

  $('#sveRecupReqBtn').click(function () {
    if ($('#recupD1').val() && $('#recupD2').val()) {
      fetch('/ERP/Profile/sveRecupReq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          d1: $('#recupD1').val(),
          d2: $('#recupD2').val(),
          m: $('#recupMsg').val(),
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Error: ${response.statusText}`);
          }
        })
        .then((data) => {
          if (data.message == 'DONE') {
            $('#recupD1').val('');
            $('#recupD2').val('');
            $('#recupMsg').val('');

            getRecupTble();
          } else {
            Toast.fire({
              icon: 'error',
              title: "l'opération a échoué",
            });
          }
        })
        .catch((error) => {
          console.error('Error:', error.message);
        });
    } else {
      Toast.fire({
        icon: 'error',
        title: 'Veuillez remplir tous les champs.',
      });
    }
  });

  $('#sveReclmBtn').click(function () {
    if ($('#reclmTpe').val() && $('#reclmTtle').val() && $('#reclmMsg').val()) {
      fetch('/ERP/Profile/getReclmTble', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tp: $('#reclmTpe').val(),
          tt: $('#reclmTtle').val(),
          ms: $('#reclmMsg').val(),
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Error: ${response.statusText}`);
          }
        })
        .then((data) => {
          if (data.message == 'DONE') {
            $('#dmndTpe').val('');
            $('#reclmTpe').val('');
            $('#reclmTtle').val('');
            $('#reclmMsg').val('');

            getReclmTble();
          } else {
            Toast.fire({
              icon: 'error',
              title: "l'opération a échoué",
            });
          }
        })
        .catch((error) => {
          console.error('Error:', error.message);
        });
    } else {
      Toast.fire({
        icon: 'error',
        title: 'Veuillez remplir tous les champs.',
      });
    }
  });

  $('#dmndTpe').on('change', () => {
    if ($('#dmndTpe').val() == 'Demande') {
      $('#reclmTpe').html(
        `
        <option value="Modification RIB"> Modification RIB </option>
        <option value="Modification Adresse"> Modification Adresse </option>
        <option value="Modification Situation Familiale" > Modification Situation Familiale </option>
        <option value="Déclaration d'un nouveau né" > Déclaration d'un nouveau né </option>
        <option value="Autre">Autre</option>
        `
      );
    } else {
      $('#reclmTpe').html(
        `
        <option value="Réclamation Anonyme"> Réclamation Anonyme </option>
        <option value="Autre">Autre</option>
        `
      );
    }
  });
});
