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

var treatCnj = async (i) => {
  const { value: formValues } = await Swal.fire({
    title: 'Traiter la demande de congé',
    html:
      '<style>' +
      '.swal2-select, .swal2-textarea {' +
      '  display: block;' +
      '  width: 80%;' +
      '  padding: 0.3em;' +
      '  box-sizing: border-box;' +
      '  border: 1px solid #d9d9d9;' +
      '  border-radius: 0.25em;' +
      '  background: #fff;' +
      '  color: #545454;' +
      '  transition: border-color 0.3s, box-shadow 0.3s;' +
      '}' +
      '.swal2-select:focus, .swal2-textarea:focus {' +
      '  border-color: #b4b4b4;' +
      '  box-shadow: 0 0 0 0.2rem rgba(72, 72, 72, 0.25);' +
      '}' +
      '</style>' +
      '<select id="status" class="swal2-select">' +
      '<option  hidden value=""> Traiter ...</option>' +
      '<option value="1">Validée</option>' +
      '<option value="0">Rejetée</option>' +
      '</select>' +
      '<textarea id="comment" class="swal2-textarea" placeholder="Commentaire"></textarea>',
    focusConfirm: false,
    showCancelButton: true,
    preConfirm: () => {
      return {
        status: document.getElementById('status').value,
        comment: document.getElementById('comment').value,
      };
    },
  });
  if (formValues.status == '') {
    Toast.fire({
      icon: 'error',
      title: 'Veuillez Sélectionner le Statut de la Demande de Congé',
    });
  } else if (formValues.comment == '') {
    Toast.fire({
      icon: 'error',
      title: "S'il Vous Plaît Laissez un Commentaire",
    });
  } else {
    await fetch('/ERP/Service-Admin/tratCnj', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        i: i,
        s: formValues.status,
        c: formValues.comment,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Error: ${response.statusText}`);
        }
      })
      .then(async (data) => {
        await Toast.fire({
          icon: 'success',
          title: 'La demande de congé a été traitée',
        });
        getConjeTble();
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });
  }
};

$(document).ready(() => {
  var dtToday = new Date();

  var month = dtToday.getMonth() + 1;
  var day = dtToday.getDate();
  var year = dtToday.getFullYear() - 18;
  if (month < 10) month = '0' + month.toString();
  if (day < 10) day = '0' + day.toString();
  var minDate = year + '-' + month + '-' + day;
  var maxDate = year + '-' + month + '-' + day;
  $('#naissance').attr('max', maxDate);
  var formatDate = (d) => {
    const currentDate = new Date(d);
    let h = currentDate.getHours();
    return `${currentDate.getFullYear()}-${
      currentDate.getMonth() + 1
    }-${currentDate.getDate()} ${h.toString().padStart(2, '0')}:${currentDate
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${currentDate
      .getSeconds()
      .toString()
      .padStart(2, '0')}`;
  };
  var getStatics = () => {
    fetch('/ERP/Service-Admin/getStatics')
      .then((response) => response.json())
      .then((data) => {
        var ids = {
          CDI: 'scdi',
          CDD: 'scdd',
          ANAPEC: 'sanpc',
          CTE: 'scte',
          AUTRE: 'satre',
          All: 'sttl',
        };

        console.log(data);

        data.forEach(async (item) => {
          if (item.contractTpe) {
            await $(`#${ids[item.contractTpe]}`).html(item['count']);
          }
        });

        // $("#sttl").html(data.cntrct.ttl);
        // $("#scdi").html(data.cntrct.cdi);
        // $("#scdd").html(data.cntrct.cdd);
        // $("#sanpc").html(data.cntrct.anpc);
        // $("#scte").html(data.cntrct.cte);
        // $("#satre").html(data.cntrct.atre);
      });
  };
  var getClbs = () => {
    fetch('/ERP/Service-Admin/getAllClbrs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        a: $('#Entites').val(),
        b: $('#Statut').val(),
        c: $('#dteIntgr1').val(),
        c1: $('#dteIntgr2').val(),
        d: $('#dteLeave1').val(),
        e: $('#dteLeave2').val(),
        f: $('#ChercherAvec').val(),
        g: $('#MotCle').val(),
        dd: $('#dprt').val(),
        cc: $('#theClickedFltr').html(),
        ee: $('#EtablissementX').val(),
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
        getStatics();
        if (data.addUsrPer == 0) {
          $('#addNewUserBtn').attr('hidden', true);
        }
        var tbl = '';
        var dt = data.agnts;
        // console.log(dt);

        dt.forEach((e) => {
          tbl += `
          <tr>
            <td class="py-1">
              <a href="/ERP/Service-Admin/Collaborateur?i=${e.id}">
                <img src="images/faces/Default.jpg" alt="image" width="30px" height="30px"/>
              </a>
            </td>
            <td><a href="/ERP/Service-Admin/Collaborateur?i=${e.id}">${
            e.lname
          } ${e.fname}</a></td>
            <td>${e.nme}</td>
            <td>${e.jobeTitle}</td>
            <td>${e.phone}</td>
            <td>${e.email}</td>
            <td>${e.contractTpe}</td>
            <td>${
              formatDate(e.integrationDate).split(' ')[0].split('-')[0] > 2000
                ? formatDate(e.integrationDate).split(' ')[0]
                : '-'
            }</td>
            <td>${'N/A'}</td>
          </tr>
          `;
        });

        $('#agtTble').html(tbl);

        var dprts = data.dprts;
        var dprtSelect = ``;
        dprts.forEach((e) => {
          dprtSelect += `<option value="${e.id}">${e.nme}</option>`;
        });
        if (!$('#dprt').val()) {
          $('#dprt').html(`<option value="" >Tous</option>${dprtSelect}`);
        }
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });
  };

  getClbs();
  fetch('/getEnttiesList')
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Error: ${response.statusText}`);
      }
    })
    .then((data) => {
      $('#Entites').html(data);
    })
    .catch((error) => {
      console.error('Fetch error details:', error);
    });

  $('#sveAgntBtn').click(() => {
    if (
      $('#lnme').val() &&
      $('#fnme').val() &&
      $('#prtbl').val() &&
      $('#naissance').val() &&
      $('#Civilit').val() &&
      $('#mail').val() &&
      $('#cin').val() &&
      $('#Sfamiliale').val()
    ) {
      fetch('/ERP/Service-Admin/saveNewAgent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          a: $('#mtrcl').val(),

          e: $('#Civilit').val(),
          f: $('#lnme').val(),
          g: $('#fnme').val(),
          h: $('#naissance').val(),
          j: $('#cin').val(),
          k: $('#Sfamiliale').val(),
          m: $('#cty').val(),
          o: $('#addrss').val(),
          r: $('#prtbl').val(),
          s: $('#mail').val(),
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Error: ${response.statusText}`);
          }
        })
        .then(async (data) => {
          closePopup();
          await Swal.fire(
            `Profil créé : ${$('#fnme').val()} ${$(
              '#lnme'
            ).val()}. Informations envoyées par e-mail.`,
            '',
            'success'
          );
          window.location.replace(
            `/ERP/Service-Admin/Collaborateur?i=${data.id}`
          );
        })
        .catch((error) => {
          console.error('Error:', error.message);
        });
    } else {
      // Swal.fire({
      //   icon: "error",
      //   title: "Oops...",
      //   text: "Veuillez remplir tous les champs.",
      //   footer: "Les champs marqués d'un * sont obligatoires.",
      // });
      Toast.fire({
        icon: 'error',
        title: 'Veuillez remplir tous les champs.',
      });
      // alert("please fill all the inputs ...");
    }
  });

  $('#srchBtn').click(() => {
    getClbs();
    $('#theArrow').removeClass('triangle-up').addClass('triangle-down');
    $('#theForm').slideUp(() => {
      $('#theForm').attr('hidden', true); // Set hidden after animation completes
    });
  });

  $('.fltrBtn').on('click', function () {
    if ($(this).find('.vlu').html() == '%') {
      $('#theClickedFltr').html('');
      $('#Entites').val('');
      $('#Statut').val('');
      $('#dteIntgr1').val('');
      $('#dteIntgr2').val('');
      $('#dteLeave1').val('');
      $('#dteLeave2').val('');
      $('#MotCle').val('');
      $('#dprt').val('');
    } else {
      $('#theClickedFltr').html($(this).find('.vlu').html());
    }
    getClbs();

    $('html, body').animate(
      {
        scrollTop: $('#allClbsTble').offset().top,
      },
      'slow'
    );
  });
  $('#theFltr').click(() => {
    if ($('#theArrow').hasClass('triangle-down')) {
      $('#theArrow').removeClass('triangle-down').addClass('triangle-up');
      $('#theForm').removeAttr('hidden').hide().slideDown(); // Animate after removing 'hidden'
    } else {
      $('#theArrow').removeClass('triangle-up').addClass('triangle-down');
      $('#theForm').slideUp(() => {
        $('#theForm').attr('hidden', true); // Set hidden after animation completes
      });
    }
  });
});
