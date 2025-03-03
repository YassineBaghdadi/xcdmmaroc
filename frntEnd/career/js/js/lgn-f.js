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
  // fetch(`/Career/Profile/info`)
  //   .then((response) => {
  //     if (response.ok) {
  //       return response.json();
  //     } else {
  //       throw new Error(`Error: ${response.statusText}`);
  //     }
  //   })
  //   .then(async (data) => {
  //     console.log(data);
  //     $(".ofNme").html(data.nme);
  //     $("#startdate").html(data.startDte.split("T")[0]);
  //     $("#enddate").html(data.endDte.split("T")[0]);
  //     $("#region").html(`${data.place}, `);
  //     $("#City").html(data.city);
  //     $("#salary").html(data.salair);
  //     $("#experience").html(data.expYrs);
  //     $("#education").html(data.etudLevel);
  //     $("#Secteur").html(data.sector);
  //     $("#Fonction").html(data.fonctions);
  //     $("#cmpny").html(data.cmpny);
  //     $("#postInfo").html(data.post);
  //     $("#mssions").html(data.missions);
  //     $("#profileInfo").html(data.prfile);
  //     $("#").html(data.endDte);
  //     $("#").html(data.endDte);
  //     $("#").html(data.endDte);
  //     $("#").html(data.endDte);
  //   })
  //   .catch((error) => {
  //     console.error("Error:", error.message);
  //   });

  $('#signUpBtn').click(() => {
    if (
      $('#signUpFname').val() &&
      $('#signUpLname').val() &&
      $('#signUpEmail').val() &&
      $('#signUpPhone').val()
    ) {
      $('#signUpBtn').attr('disabled', true);
      const file = $('#CV')[0].files[0];
      const formData = new FormData();
      formData.append('cv', file);
      formData.append('fn', $('#signUpFname').val());
      formData.append('ln', $('#signUpLname').val());
      formData.append('ml', $('#signUpEmail').val());
      formData.append('ph', $('#signUpPhone').val());

      if (!file) {
        alert('Please select a PDF file');
        return;
      }

      $.ajax({
        type: 'POST',
        url: '/Login/signup',
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
          $('#signUpBtn').removeAttr('disabled');
          $('#signUpFname').val('');
          $('#signUpLname').val('');
          $('#signUpEmail').val('');
          $('#signUpPhone').val('');
          Toast.fire({
            icon: 'success',
            title:
              'Votre compte a été créé avec succès. Veuillez consulter votre boîte mail pour récupérer les identifiants de votre compte.',
          });
        },
        error: function (error) {
          // Parse and display the error message if available
          let errorMessage = 'Une erreur inattendue';
          if (error.responseJSON && error.responseJSON.message) {
            errorMessage = error.responseJSON.message;
          }

          // Display error toast
          Toast.fire({
            icon: 'error',
            title: errorMessage,
          });

          console.error('Error:', error);
        },
      });
    } else {
      Toast.fire({
        icon: 'error',
        title: "L'opération a échoué",
      });
    }
  });

  $('#lgnBtn').click(() => {
    if ($('#lgnEmail').val() && $('#lgnPwd').val()) {
      $('#lgnBtn').html('<i class="fa fa-spinner fa-spin"></i> ');
      $('#lgnBtn').attr('disabled', 'disabled');

      fetch('/Career/Login/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          l1: $('#lgnEmail').val(),
          l2: $('#lgnPwd').val(),
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
          console.log(data);
          if (data) {
            const urlParams = new URLSearchParams(window.location.search);
            const nxt = urlParams.get('next') || '/Career';
            window.location.href = nxt;
          } else {
            $('#lgnBtn').html('Se connecter');
            $('#lgnBtn').removeAttr('disabled');
            Toast.fire({
              icon: 'error',
              title:
                "Identifiants invalides : le nom d'utilisateur ou le mot de passe est incorrect",
            });
          }
        })
        .catch((error) => {
          $('#lgnBtn').html('Se connecter');
          $('#lgnBtn').removeAttr('disabled');
          Toast.fire({
            icon: 'error',
            title: error,
          });
          console.error('Login Error:', error);
        });
    } else {
      Toast.fire({
        icon: 'error',
        title: `Identifiants invalides : le nom d'utilisateur ou le mot de passe est incorrect`,
      });
    }
  });

  $('#subBtn').click(() => {
    // alert($("#subEmail").val());
    fetch('/Career/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        e: $('#subEmail').val(),
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Login failed');
        }
      })
      .then(async (data) => {
        if (data == 'subscribed') {
          Toast.fire({
            icon: 'success',
            title: 'Votre email a été enregistré dans notre newsletter.',
          });
        }
      })
      .catch((error) => {
        console.error('Login Error:', error);
      });
  });

  $('#frgtPsw').click(() => {
    $('#frgtPswWnd').removeAttr('hidden');
    $('#lgnWnd').attr('hidden', 'hidden');
    $('#createAccWnd').attr('hidden', 'hidden');
  });

  $('#resetPswdBtn').click(() => {
    if ($('#renitCompteMail').val()) {
      fetch(`/Career/Login/reset?x=${$('#renitCompteMail').val()}`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Login failed');
          }
        })
        .then((data) => {
          console.log(data);

          if (data.message == 'done') {
            Toast.fire({
              icon: 'success',
              title: 'Votre mot de passe a été envoyé à votre adresse email.',
            });
            $('#lgnWnd').removeAttr('hidden');
            $('#frgtPswWnd').attr('hidden', 'hidden');
          } else {
            Toast.fire({
              icon: 'error',
              title:
                'Cette adresse email ne semble pas être enregistrée, vous pouvez créer un compte.',
            });
            $('#createAccWnd').removeAttr('hidden');
            $('#frgtPswWnd').attr('hidden', 'hidden');
            $('#signUpEmail').val($('#renitCompteMail').val());
            $('#showLgnBtn').removeAttr('hidden');
          }
        })
        .catch((error) => {
          console.error('Login Error:', error);
        });
    }
  });

  $('#showLgnBtn').click(() => {
    $('#lgnWnd').removeAttr('hidden');
    $('#createAccWnd').attr('hidden', 'hidden');
  });
});
