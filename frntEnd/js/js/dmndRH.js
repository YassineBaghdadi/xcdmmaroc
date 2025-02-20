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

// var treatCnj = async (i) => {
//   const { value: formValues } = await Swal.fire({
//     title: "Traiter la demande de congé",
//     html:
//         '<style>' +
//         '.swal2-select, .swal2-textarea {' +
//         '  display: block;' +
//         '  width: 80%;' +
//         '  padding: 0.3em;' +
//         '  box-sizing: border-box;' +
//         '  border: 1px solid #d9d9d9;' +
//         '  border-radius: 0.25em;' +
//         '  background: #fff;' +
//         '  color: #545454;' +
//         '  transition: border-color 0.3s, box-shadow 0.3s;' +
//         '}' +
//         '.swal2-select:focus, .swal2-textarea:focus {' +
//         '  border-color: #b4b4b4;' +
//         '  box-shadow: 0 0 0 0.2rem rgba(72, 72, 72, 0.25);' +
//         '}' +
//         '</style>' +
//         '<select id="status" class="swal2-select">' +
//         '<option  hidden value=""> Traiter ...</option>' +
//         '<option value="1">Validée</option>' +
//         '<option value="0">Rejetée</option>' +
//         '</select>' +
//         '<textarea id="comment" class="swal2-textarea" placeholder="Commentaire"></textarea>',
//     focusConfirm: false,
//     showCancelButton: true,
//     preConfirm: () => {
//         return {
//             status: document.getElementById('status').value,
//             comment: document.getElementById('comment').value
//         };
//     },

// });
// if (formValues.status == "") {
//   Toast.fire({
//     icon: "error",
//     title: "Veuillez Sélectionner le Statut de la Demande de Congé",
//   });
// }
// else if (formValues.comment == "") {
//   Toast.fire({
//     icon: "error",
//     title: "S'il Vous Plaît Laissez un Commentaire",
//   });
// }else{
//   await fetch("/Service-Admin/tratCnj", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       i:i,
//       s: formValues.status,
//       c: formValues.comment,

//     }),
//   })
//     .then((response) => {
//       if (response.ok) {
//         return response.json();
//       } else {
//         throw new Error(`Error: ${response.statusText}`);
//       }
//     })
//     .then(async (data) => {
//       await Toast.fire({
//         icon: "success",
//         title: "La demande de congé a été traitée",
//       });
//       getConjeTble();
//     })
//     .catch((error) => {
//       console.error("Error:", error.message);
//     });
// }

//     };

var openTreatWndw = (i, t) => {
  fetch('/Service-Admin/getTreatWindow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      i: i,
      t: t,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error);
      } else {
        // console.log(data);
        $('#trtWindow').html(data);
        // $("#soldConge").html(data.sc);
        document.getElementById('cnjTreatPopUp').style.display = 'block';
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};

// var openTreatWndw = (i, t) =>{

//   fetch("/Service-Admin/openDCStrWndw", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       i: i,
//     }),
//   })
//         .then((response) => response.json())
//         .then((data) => {
//           // $("#trtWindow").html(data);

//           // document.getElementById('cnjTreatPopUp').style.display = 'block';
//           Swal.fire({

//             html: data,
//             showCloseButton: true,
//             showCancelButton: false,
//             showConfirmButton: false,
//             focusConfirm: false,

//           });
//         })
//         .catch((error) => {
//           console.error("Error:", error);
//         });

// }

var getRhDemmands = () => {
  fetch('/Service-Admin/getRhDemmand', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      a: $('#Entite').val(),
      b: $('#Etablissement').val(),
      c: $('#Statut').val(),
      d: $('#dmndte1').val(),
      e: $('#dmndte2').val(),
      g: $('#MotCle').val(),
      cc: $('#theClickedFltr').html(),
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
      $('#drDmndCounterALL').html(data.sttcs.allCount);
      $('#drDmndCounterCNJ').html(data.sttcs.cnjCount);
      $('#drDmndCounterDchrj').html(data.sttcs.dchrgCount);
      $('#drDmndCounterDCR').html(data.sttcs.dcCount);
      $('#dmndsTbl').html(data.tbl);
    })
    .catch((error) => {
      console.error('Error:', error.message);
    });
};

var RHtreatCnj = async (s, i) => {
  if ($('#cnjTrComment').val()) {
    fetch('/Service-Admin/treatTheCnj', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        i: i,
        s: s,
        c: $('#cnjTrComment').val(),
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Login failed');
        }
      })
      .then((data) => {
        getRhDemmands();
        document.getElementById('cnjTreatPopUp').style.display = 'none';
        Toast.fire({
          icon: 'success',
          title: 'la demande de congé a été traitée',
        });
      })
      .catch((error) => {
        Toast.fire({
          icon: 'error',
          title: error,
        });
        console.error('Login Error:', error);
      });
  } else {
    $('#cnjTrComment').css('border', '2px solid red');
    Toast.fire({
      icon: 'error',
      title: "S'il vous plaît laissez un commentaire",
    });
  }
};

var treatTheDchrg = (s, i) => {
  if ($('#DchrgTrComment').val()) {
    var msg = '';

    fetch('/Service-Admin/treatTheDchrg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        s: s,
        i: i,
        c: $('#DchrgTrComment').val(),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        getRhDemmands();
        Swal.fire({
          icon: 'success',
          title: 'La demande de décharge a été traitée',
        });
        $('#cnjTreatPopUp').hide();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  } else {
    $('#DchrgTrComment').css('border', '1px solid red');
    Toast.fire({
      icon: 'error',
      title: 'Veuillez écrire un commentaire avant le traitement',
    });
  }
};

var RHtreatRCPreq = (s, i) => {
  var msg = '';

  fetch('/Service-Admin/RHtreatRCPreq', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      s: s,
      i: i,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      getRhDemmands();
      Swal.fire({
        icon: 'success',
        title: 'La demande de décharge a été traitée',
      });
      $('#cnjTreatPopUp').hide();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};

var treatTheDplcm = (s, i) => {
  if ($('#DplcmComment').val()) {
    var msg = '';

    fetch('/Service-Admin/treatTheDplcm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        s: s,
        i: i,
        c: $('#DplcmComment').val(),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        getRhDemmands();
        Swal.fire({
          icon: 'success',
          title: 'La demande de déplacement a été traitée',
        });
        $('#cnjTreatPopUp').hide();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  } else {
    $('#DplcmComment').css('border', '1px solid red');
    Toast.fire({
      icon: 'error',
      title: 'Veuillez écrire un commentaire avant le traitement',
    });
  }
};

var RHtreatDCSreq = (s, i) => {
  fetch('/Service-Admin/RHtreatDCSreq', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      i: i,
      s: s,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      getRhDemmands();
      document.getElementById('cnjTreatPopUp').style.display = 'none';
      Toast.fire({
        icon: 'success',
        title: 'La demande des Documents a été traitée',
      });
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};

var downld = (i, d) => {
  fetch('/Service-Admin/RHdownldDCSreq', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      i: i,
      d: d,
    }),
  })
    .then((response) => {
      console.log(response);

      if (response.ok) {
        const filename = response.headers
          .get('Content-Disposition')
          .split('filename=')[1]
          .replace(/"/g, '');
        return response.blob().then((blob) => ({ blob, filename }));
      }
      throw new Error('Network response was not ok.');
    })
    .then(({ blob, filename }) => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
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

  fetch('/getEnttiesList')
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Error: ${response.statusText}`);
      }
    })
    .then((data) => {
      $('#Entite').html(data);
    })
    .catch((error) => {
      console.error('Fetch error details:', error);
    });

  getRhDemmands();
  $('.fltrBtn').on('click', function () {
    if ($(this).find('.vlu').html() == '%') {
      $('#theClickedFltr').html('');
      $('#Entite').val('');
      $('#Statut').val('');
      $('#Etablissement').val('');
      $('#dmndte1').val('');
      $('#dmndte2').val('');
      $('#MotCle').val('');
    } else {
      $('#theClickedFltr').html($(this).find('.vlu').html());
    }
    getRhDemmands();

    $('html, body').animate(
      {
        scrollTop: $('#allDmndsTble').offset().top,
      },
      'slow'
    );
  });

  $('.dmndRhFltr').change(() => {
    getRhDemmands();
  });
});
