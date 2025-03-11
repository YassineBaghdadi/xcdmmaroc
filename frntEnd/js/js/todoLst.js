var openTreatWndw = (i) => {
  // document.getElementById('cnjTreatPopUp').style.display = 'block';
  fetch('/ERP/TO-DO-Liste/getTreatWindow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      i: i,
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

var getTasks = async () => {
  await fetch('/ERP/TO-DO-Liste/getTasks')
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Error: ${response.statusText}`);
      }
    })
    .then(async (data) => {
      $('#tdLstTbl').html(data.t);
    })
    .catch((error) => {
      console.error('Error:', error.message);
    });
};
var treatTheDchrg = (t, tt) => {
  if ($('#DchrgTrComment').val()) {
    var msg = '';
    if (t) {
      msg =
        'La demande a été attribuée au département des ressources humaines.';
    }

    fetch('/ERP/TO-DO-Liste/treatTheDchrg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        i: t,
        t: tt,
        c: $('#DchrgTrComment').val(),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        getTasks();
        Swal.fire({
          icon: 'success',
          title: 'La tâche est terminée.',
          text: msg,
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

var RHtreatRCPreq = (t, tt) => {
  var msg = '';
  if (t) {
    msg = 'La demande a été attribuée au département des ressources humaines.';
  }

  fetch('/ERP/TO-DO-Liste/RHtreatRCPreq', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      i: t,
      t: tt,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      getTasks();
      Swal.fire({
        icon: 'success',
        title: 'La tâche est terminée.',
        text: msg,
      });
      $('#cnjTreatPopUp').hide();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};
var getTskCntrTbl = (i) => {
  fetch('/ERP/TO-DO-Liste/getTaskCntrbs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      i: i,
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
      $('#tskCntrbs').html(data.tbl);
    })
    .catch((error) => {
      console.error('Error:', error.message);
    });
};

var openAssignWindow = async (i, nme) => {
  document.getElementById('tskNmePpup').innerHTML = nme;
  document.getElementById('tskPpId').innerHTML = i;

  getTskCntrTbl(i);

  document.getElementById('assignTaskWindow').style.display = 'block';
};

$(document).ready(() => {
  $('#addTaskBtn').click(() => {
    if ($('#tskNme').val()) {
      fetch('/ERP/TO-DO-Liste/addNewTsk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          t: $('#tskNme').val(),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          getTasks();
          $('#tskNme').val();
          Swal.fire({
            icon: 'success',
            title: 'la tâche est enregistrée',
          });
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    } else {
      $('#tskNme').focus();
      Swal.fire({
        icon: 'error',
        title: 'Erreur de saisie',
        text: 'Veuillez écrire le nom de la tâche',
      });
    }
  });

  getTasks();

  $('#saveTaskAssign').click(() => {
    fetch('/ERP/TO-DO-Liste/assignUsersToTask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        i: $('#tskPpId').html(),
        u: $('#LSTUser').val(),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        $('#LSTUser').val('');
        getTskCntrTbl($('#tskPpId').html());
        Toast.fire({
          icon: 'success',
          title: "l'opération effectuée",
        });
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    // console.log($("#LSTUser").val());
  });

  $.get('/ERP/TO-DO-Liste/getAllUsers', function (data) {
    $('#LSTUser').html(data);
    // console.log(data);
  }).fail(function () {
    console.error('Failed to fetch default image.');
  });

  // fetch("/TO-DO-Liste/getAssignHstr", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     t:$('#tskNme').val(),
  //   }),
  // })
  // .then((response) => response.json())
  // .then((data) => {

  // })
  // .catch((error) => {
  //   console.error("Error:", error);
  // });
});
