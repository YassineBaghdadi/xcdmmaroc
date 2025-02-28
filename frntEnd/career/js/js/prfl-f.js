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

var removeLang = (i) => {
  fetch('/Career/Profile/removeLang', {
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
        throw new Error('Login failed');
      }
    })
    .then((data) => {
      getInfos();
      Toast.fire({
        icon: 'succes',
        title: 'La suppression effectuée',
      });
    })
    .catch((error) => {
      console.error('Login Error:', error);
    });
};

var removeSKL = (i) => {
  fetch('/Career/Profile/removeSKL', {
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
        throw new Error('Login failed');
      }
    })
    .then((data) => {
      getInfos();
      Toast.fire({
        icon: 'succes',
        title: 'La suppression effectuée',
      });
    })
    .catch((error) => {
      console.error('Login Error:', error);
    });
};

var getInfos = () => {
  fetch(`/Career/Profile/info`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Error: ${response.statusText}`);
      }
    })
    .then(async (data) => {
      // console.log(data);

      $('#fullName').html(`${data.info.fname} ${data.info.lname}`);
      $('#prflTTle').html(data.info.prflTtle);
      // $("#Civilite").val(data.info.civilite);

      $('#Civilite select').val(data.info.civilite).change();
      $('#Civilite .nice-select').find('.current').text(data.info.civilite);
      $('#Civilite .nice-select').find('.option').removeClass('selected');
      $('#Civilite .nice-select')
        .find(`.option[data-value="${data.info.civilite}"]`)
        .addClass('selected');

      $('#fname').val(data.info.fname);
      $('#lname').val(data.info.lname);
      var bd = data.info.bd;
      $('#bd').val(bd.split('T')[0] || null);
      $('#nationality').val(data.info.nationality);

      // $("#Situation_familiale").val(data.info.familystatus);
      $('#Situation_familiale select').val(data.info.familystatus).change();
      $('#Situation_familiale .nice-select')
        .find('.current')
        .text(data.info.familystatus);
      $('#Situation_familiale .nice-select')
        .find('.option')
        .removeClass('selected');
      $('#Situation_familiale .nice-select')
        .find(`.option[data-value="${data.info.familystatus}"]`)
        .addClass('selected');

      $('#phone').val(data.info.phone);
      $('#email').val(data.info.email);
      $('#lnkdin').val(data.info.linkedIn);
      $('#address').val(data.info.address);
      $('#zip').val(data.info.zip);
      $('#city').val(data.info.city);

      // $("#Disponibilite").val(data.info.disponibility);
      $('#Disponibilite select').val(data.info.disponibility).change();
      $('#Disponibilite .nice-select')
        .find('.current')
        .text(data.info.disponibility);
      $('#Disponibilite .nice-select').find('.option').removeClass('selected');
      $('#Disponibilite .nice-select')
        .find(`.option[data-value="${data.info.disponibility}"]`)
        .addClass('selected');

      // $("#fonctions").val(data.info.actualFonction);
      // $("#fonctions select").val(data.info.actualFonction).change();
      // $("#fonctions .nice-select")
      //   .find(".current")
      //   .text(data.info.actualFonction);
      // $("#fonctions .nice-select").find(".option").removeClass("selected");
      // $("#fonctions .nice-select")
      //   .find(`.option[data-value="${data.info.actualFonction}"]`)
      //   .addClass("selected");
      $('#fonctions').val(data.info.actualFonction).trigger('change');

      // $("#fonctionssouhait").val(data.info.desiredFonction);
      $('#fonctionssouhait').val(data.info.desiredFonction).trigger('change');

      // $("#title").val(data.info.prflTtle);
      $('#title').val(data.info.prflTtle).trigger('change');

      // $("#expYrs").val(data.info.expYrs);
      $('#expYrs').val(data.info.expYrs).trigger('change');

      // $("#Secteur").val(data.info.actualSector);
      $('#Secteur').val(data.info.actualSector).trigger('change');

      // $("#SecteurSouhaite").val(data.info.desiredSector);
      $('#SecteurSouhaite').val(data.info.desiredSector).trigger('change');

      // $("#regionA").val(data.info.actualRegion);
      $('#regionA').val(data.info.actualRegion).trigger('change');

      // $("#regionS").val(data.info.desiredRegion);
      $('#regionS').val(data.info.desiredRegion).trigger('change');

      // $("#SalaireA").val(data.info.actualSalaire);
      $('#SalaireA').val(data.info.actualSalaire).trigger('change');

      // $("#SalaireS").val(data.info.desiredSalaire);
      $('#SalaireS').val(data.info.desiredSalaire).trigger('change');

      // $("#etudLvl").val(data.info.etudLevel);
      $('#etudLvl').val(data.info.etudLevel).trigger('change');

      // $("#formation").val(data.info.formation);
      $('#formation').val(data.info.formation).trigger('change');

      document.getElementById('prfPic').src = `/Profile/getPrflPic`;

      var langs = data.langs;
      var langsHtml = ``;

      langs.forEach((e) => {
        langsHtml += `
      

      <div class="switch-wrap d-flex justify-content-between">
        <p class="text-heading">${e.nme} :  </p> 
        <span name="Niveau" id="Niveau">${e.lvl}</span> 
        <span style="cursor:pointer;" onclick="removeLang(${e.id})" class="fa fa-close text-danger"></span>
      </div>
      `;
      });

      var skills = data.skls;
      var sklsHtml = ``;

      skills.forEach((e) => {
        sklsHtml += `
        <li style="border:1px grey solid; padding:5px;margin:4px; border-radius: 50% 20% / 10% 40%;"><span style="cursor:pointer; margin-right:8px;" onclick="removeSKL(${e.id})" class="fa fa-close text-danger "> </span>${e.nme}</li>
      `;
      });

      $('#langsSpace').html(langsHtml);
      $('#sklsSpace').html(sklsHtml);
    })
    .catch((error) => {
      console.error('Error:', error.message);
    });
};
$(document).ready(() => {
  // getPrfPc();
  $('#addLangBtn').click(() => {
    if ($('#Langues').val() && $('#NiveauLangue').val()) {
      fetch('/Career/Profile/addLang', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          n: $('#Langues').val(),
          l: $('#NiveauLangue').val(),
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
          if (data == 1) {
            Toast.fire({
              icon: 'error',
              title: `la langue ${$('#Langues').val()} existe déjà`,
            });
          } else {
            Toast.fire({
              icon: 'success',
              title: `la langue ${$(
                '#Langues'
              ).val()} a été ajoutée à la liste`,
            });
            getInfos();

            $('#Langues').val('').trigger('change');
            $('#NiveauLangue').val('').trigger('change');
          }
        })
        .catch((error) => {
          console.error('Login Error:', error);
        });
    } else {
      Toast.fire({
        icon: 'error',
        title: 'Veuillez remplir toutes les informations',
      });
    }
  });

  $('#addSkillBtn').click(() => {
    if ($('#skill').val()) {
      fetch('/Career/Profile/addSKL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          n: $('#skill').val(),
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
          Toast.fire({
            icon: 'success',
            title: `La compétence ${$(
              '#skill'
            ).val()} a été ajoutée à la liste`,
          });
          $('#skill').val('');

          getInfos();
        })
        .catch((error) => {
          console.error('Login Error:', error);
        });
    } else {
      Toast.fire({
        icon: 'error',
        title: 'Veuillez remplir toutes les informations',
      });
    }
  });

  $(`#CV`).change(() => {
    const file = document.getElementById('CV').files[0];
    if (file) {
      const formData = new FormData();
      formData.append('cv', file);

      fetch('/Career/Profile/uploadCV', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.text())
        .then((data) => {
          Toast.fire({
            icon: 'success',
            title: 'Le fichier a été téléchargé dans la base de données',
          });
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
        });
    }
  });

  $('#updateBtn').click(() => {
    if (
      $('#Civilite select').val() &&
      $('#nationality').val() &&
      $('#phone').val() &&
      $('#email').val() &&
      $('#city').val()
    ) {
      const data = {
        civilite: $('#Civilite  select').val(),
        firstName: $('#fname').val(),
        lastName: $('#lname').val(),
        birthDate: $('#bd').val(),
        nationality: $('#nationality').val(),
        maritalStatus: $('#Situation_familiale  select').val(),
        phone: $('#phone').val(),
        email: $('#email').val(),
        linkedin: $('#lnkdin').val(),
        address: $('#address').val(),
        zip: $('#zip').val(),
        city: $('#city').val(),
        availability: $('#Disponibilite select').val(),
        functions: $('#fonctions').val(),
        desiredFunctions: $('#fonctionssouhait').val(),
        title: $('#title').val(),
        experienceYears: $('#expYrs').val(),
        sector: $('#Secteur').val(),
        desiredSector: $('#SecteurSouhaite').val(),
        regionA: $('#regionA').val(),
        regionS: $('#regionS').val(),
        salaryA: $('#SalaireA').val(),
        salaryS: $('#SalaireS').val(),
        educationLevel: $('#etudLvl').val(),
        formation: $('#formation').val(),
      };
      fetch('/Career/Profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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

          getInfos();
          Toast.fire({
            icon: 'success',
            title: 'Votre profil a été mis à jour',
          });
        })
        .catch((error) => {
          console.error('Login Error:', error);
        });
    } else {
      Toast.fire({
        icon: 'error',
        title: 'Veuillez remplir toutes les informations importantes',
      });
    }
  });

  $('#picBtn').click(() => {
    $('#prfPicInp').click();
  });

  $('#prfPicInp').change(() => {
    const file = document.getElementById('prfPicInp').files[0];
    if (file) {
      const formData = new FormData();
      formData.append('pc', file);

      fetch('/Career/Profile/changePic', {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            Toast.fire({
              icon: 'error',
              title: 'Erreur : essayez une autre photo',
            });
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.text();
        })
        .then((data) => {
          Toast.fire({
            icon: 'success',
            title: "L'image a été enregistrée",
          });

          // document.getElementById("prfPic").src = `/Profile/getPrflPic`;
          $('#prfPic').empty();
          $('#prfPic').attr(
            'src',
            `/Profile/getPrflPic?timestamp=${new Date().getTime()}`
          );
          // document.getElementById("prfPic").src = `/Profile/getPrflPic`;
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
          Toast.fire({
            icon: 'error',
            title: 'Erreur : essayez une autre photo',
          });
        });
    }
  });

  getInfos();
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
});
