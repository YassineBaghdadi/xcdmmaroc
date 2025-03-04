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

var removeSKL = (i) => {
  fetch('/ERP/Recrutement/Candidats/removeSKL', {
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
      window.location.reload();
      Toast.fire({
        icon: 'succes',
        title: 'La suppression effectuée',
      });
    })
    .catch((error) => {
      console.error('Login Error:', error);
    });
};

function evalLang(btn) {
  const row = $(btn).closest('tr');
  if (row.find('.NiveauLangue').val()) {
    $.ajax({
      type: 'POST',
      url: '/ERP/Recrutement/Candidats/evalLang',
      data: {
        i: row.find('#langsID').html(),
        niv: row.find('.NiveauLangue').val(),
      },
      success: (data) => {
        window.location.reload();
        getLangs();
        Toast.fire({
          icon: 'success',
          title: `L'évaluation soumise`,
        });
      },
      error: (xhr, status, error) => {
        console.log(xhr.responseText);
      },
    });
  } else {
    Toast.fire({
      icon: 'error',
      title: 'veuillez sélectionner un niveau',
    });
  }
}

$(document).ready(() => {
  const ID =
    (window.location.href.match(/\/Candidats\/([^\/]+)/) || [])[1] || null;

  if (!ID) {
    window.location.href = '/ERP/Recrutement/Candidats/';
  }

  var changeSelect = (id, value) => {
    $(`#${id} select`).val(value).change();
    $(`#${id} .nice-select`).find('.current').text(value);
    $(`#${id} .nice-select`).find('.option').removeClass('selected');
    $(`#${id} .nice-select`)
      .find(`.option[data-value="${value}"]`)
      .addClass('selected');
  };
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
  let getCndInfo = () => {
    $.ajax({
      type: 'POST',
      url: '/ERP/Recrutement/Candidats/getCndInfo',
      data: { i: ID },
      success: (data) => {
        // console.log(data.infos);

        // $('#Civilite').val(data.infos.civilite);
        changeSelect('Civilite', data.infos.civilite);
        $('#fname').val(data.infos.fname);
        $('#lname').val(data.infos.lname);
        $('#PrfllastUpdate').html(formatDate(data.infos.lastUpdate));

        $('#Naissance').val(
          new Date(data.infos.bd).toISOString().split('T')[0]
        );
        $('#nationality').val(data.infos.nationality);

        changeSelect('familystatus', data.infos.familystatus);

        // $('#familystatus').val(data.infos.familystatus);
        $('#phone').val(data.infos.phone);
        $('#email').val(data.infos.email);
        $('#address').val(data.infos.address);
        $('#zip').val(data.infos.zip);
        $('#city').val(data.infos.city);
        $('#lastUpdate').val(`last Update : ${data.infos.lastUpdate}`);
        $('#Nominationposteactuel').val(data.infos.prflTtle);

        changeSelect('etudLevel', data.infos.etudLevel);

        // $('#etudLevel').val(data.infos.etudLevel);
        // $('#formation').val(data.infos.formation);
        changeSelect('formation', data.infos.formation);

        // $('#desiredSector').val(data.infos.desiredSector);
        changeSelect('actualSector', data.infos.actualSector);
        changeSelect('desiredSector', data.infos.desiredSector);
        changeSelect('expYrs', data.infos.expYrs);
        changeSelect('actualFonction', data.infos.actualFonction);
        changeSelect('desiredFonction', data.infos.desiredFonction);
        changeSelect('actualRegion', data.infos.actualRegion);
        changeSelect('desiredRegion', data.infos.desiredRegion);
        changeSelect('actualSalaire', data.infos.actualSalaire);
        changeSelect('desiredSalaire', data.infos.desiredSalaire);
        changeSelect('disponibility', data.infos.disponibility);
        // changeSelect('desiredRegion', data.infos.desiredRegion);
        // changeSelect('desiredRegion', data.infos.desiredRegion);
        // changeSelect('desiredRegion', data.infos.desiredRegion);

        // $('#actualFonction').val(data.infos.actualFonction);
        // $('#desiredFonction').val(data.infos.desiredFonction);
        // $('#actualRegion').val(data.infos.actualRegion);
        // $('#desiredRegion').val(data.infos.desiredRegion);
        // $('#actualSalaire').val(data.infos.actualSalaire);
        // $('#desiredSalaire').val(data.infos.desiredSalaire);
        if (data.infos.cvEXT) {
          $('#CV').attr(
            'href',
            `/ERP/Recrutement/getCV?i=${data.infos.uniqID}`
          );

          $('#CV').removeAttr('hidden');
        }
      },
      error: (xhr, status, error) => {
        console.log(xhr.responseText);
      },
    });
  };

  getCndInfo();

  let getLangs = () => {
    $.ajax({
      type: 'POST',
      url: '/ERP/Recrutement/Candidats/getLangs',
      data: {
        i: ID,
      },
      success: (data) => {
        // console.log(data);

        $('#langsTbl tbody').empty();
        data.forEach((e) => {
          var s = `
            <td class="text-center">
            <div class="default-select form-cols" id="LangLevel" >
            <select class="js-example-basic-single w-100 NiveauLangue" name="NiveauLangue" >
              <option value="">Niveau</option>
              <option value="Débutant">Débutant</option>
              <option value="Pré-intermédiaire"> Pré-intermédiaire </option>
              <option value="Intermédiaire"> Intermédiaire </option>
              <option value="Intermédiaire-avancé">Intermédiaire-avancé </option>
              <option value="Avancé">Avancé</option>
            </select>
            </div>
            </td>
            <td class="text-center">-</td>
            <td class="text-center">-</td>
            <td class="text-center">
            <button type="button" class="btn btn-warning md-5 small saveLangEvaluation" onclick="evalLang(this)" > Save </button>
            </td>
          `;
          if (e.evaluatedBy) {
            s = `<td class="text-center">${e.evaluation}</td>
                  <td class="text-center">${e.evaluationDte}</td>
                  <td class="text-center">${e.evaluatedBy}</td>
                  <td class="text-center">

                  </td>
            `;
          }
          let newRow = `
          <tr>
            <td class="text-center">${e.nme}<span hidden id="langsID">${
            e.id
          }</span></td>
            <td class="text-center">${e.lvl}</td>
            <td class="text-center">
            ${e.addedBy}
            </td>
            <td class="text-center">
            ${formatDate(e.addedDte)}
            </td>
            ${s}
            
          </tr>`;

          $('#langsTbl tbody').append(newRow);
        });
      },
      error: (xhr, status, error) => {
        console.log(xhr.responseText);
      },
    });
  };
  getLangs();

  let getSkills = () => {
    $.ajax({
      type: 'POST',
      url: '/ERP/Recrutement/Candidats/getSkills',
      data: {
        i: ID,
      },
      success: (data) => {
        // console.log(data);

        let tbl = ``;
        data.forEach((e) => {
          tbl += `
            <tr>
              <td class="pl-0">
                <label class="form-check-label">
                <input class="checkbox" type="checkbox"/>${e.nme}</label>
              </td>
              <td>
              
                <a type="button" onclick="removeSKL(${e.id})"
                                          ><i class="remove ti-close"></i
                                        ></a>
              </td>
            </tr>
          `;
        });
        $('#skillsTbl').html(tbl);
      },
      error: (xhr, status, error) => {
        console.log(xhr.responseText);
      },
    });
  };
  getSkills();

  $('#addNewSklBtn').click(() => {
    if ($('#Competence').val()) {
      fetch('/ERP/Recrutement/Candidats/addSKL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          i: ID,
          s: $('#Competence').val(),
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
          $('#Competence').val('');
          getSkills();
          Toast.fire({
            icon: 'succes',
            title: 'La compétence a été ajoutée avec succès',
          });
        })
        .catch((error) => {
          console.error('Login Error:', error);
        });
    } else {
      Toast.fire({
        icon: 'error',
        title: 'Veuillez remplir la saisie de compétence',
      });
    }
  });

  let getApplies = () => {
    $.ajax({
      type: 'POST',
      url: '/ERP/Recrutement/Candidats/getApplies',
      data: {
        i: ID,
      },
      success: (data) => {
        console.log(data);

        let tbl = ``;
        data.forEach((e) => {
          tbl += `
            <tr>
              <td class="text-center">
                <a href="#" data-id="${e.id}" data-nme="${
            e.ofrNme
          }"class="nav-link" data-toggle="modal" data-target="#Qualification" >
                <span>${formatDate(e.dte)}</span></a>
              </td>
                 <td class="text-center"><!-- Le nom de la personne qui y avait postuler a l'offre soit le candidat ou bien le recruteur-->
                ${e.qlfByNme}
              </td>
              <td class="text-center">
                ${e.ofrNme}
              </td>
              
              <td class="text-center">
                ${e.qlf}
              </td>
              <td class="text-center">
                ${e.qlfCmnt}
              </td>
              <td class="text-center">
                ${e.qlfByNme}
              </td>
              <td class="text-center"> 
                ${e.qlfDte}
              </td>
            </tr>
          `;
        });
        $('#appliesTbl').html(tbl);
      },
      error: (xhr, status, error) => {
        console.log(xhr.responseText);
      },
    });
  };

  getApplies();

  $('#addLangBtn').click(() => {
    if ($('#NiveauLangue').val() && $('#langsList').val()) {
      $('#addLangBtn').attr('disabled', true);
      $.ajax({
        type: 'POST',
        url: '/ERP/Recrutement/Candidats/addLang',
        data: {
          i: ID,
          niv: $('#NiveauLangue').val(),
          lng: $('#langsList').val(),
        },
        success: (data) => {
          $('#NiveauLangue').val('');
          $('#langsList').val('');
          getLangs();
          Toast.fire({
            icon: 'succes',
            title: 'La Langue a été ajoutée avec succès',
          });
          $('#addLangBtn').removeAttr('disabled');
        },
        error: (xhr, status, error) => {
          console.log(xhr.responseText);
          Toast.fire({
            icon: 'error',
            title: xhr.responseText,
          });
        },
      });
    } else {
      Toast.fire({
        icon: 'error',
        title: 'Veuillez remplir les inputs',
      });
    }
  });

  $('#updatePersonalInfoBtn').click(() => {
    if (
      $('#lname').val() &&
      $('#fname').val() &&
      $('#phone').val() &&
      $('#email').val()
    ) {
      $.ajax({
        type: 'POST',
        url: '/ERP/Recrutement/Candidats/updatePersonalInfo',
        data: {
          i: ID,
          Civilite: $('#Civilite select').val(),
          lname: $('#lname').val(),
          fname: $('#fname').val(),
          Naissance: $('#Naissance').val(),
          nationality: $('#nationality').val(),
          familystatus: $('#familystatus select').val(),
          phone: $('#phone').val(),
          email: $('#email').val(),
          address: $('#address').val(),
          Postal: $('#Postal').val(),
          city: $('#city').val(),
        },
        success: (data) => {
          getCndInfo();
          Toast.fire({
            icon: 'success',
            title:
              'Les informations personnelles ont été mises à jour avec succès',
          });
        },
        error: (xhr, status, error) => {
          console.log(xhr.responseText);
        },
      });
    } else {
      Toast.fire({
        icon: 'error',
        title: 'Erreur',
      });
    }
  });

  $('#profileInfoUpdateBtn').click(() => {
    $.ajax({
      type: 'POST',
      url: '/ERP/Recrutement/Candidats/profileInfoUpdate',
      data: {
        i: ID,
        Nominationposteactuel: $('#Nominationposteactuel').val(),
        etudLevel: $('#etudLevel select').val(),
        formation: $('#formation select').val(),
        expYrs: $('#expYrs select').val(),
        actualSector: $('#actualSector select').val(),
        desiredSector: $('#desiredSector select').val(),
        actualFonction: $('#actualFonction select').val(),
        desiredFonction: $('#desiredFonction select').val(),
        actualSalaire: $('#actualSalaire select').val(),
        desiredSalaire: $('#desiredSalaire select').val(),
        actualRegion: $('#actualRegion select').val(),
        desiredRegion: $('#desiredRegion select').val(),
        disponibility: $('#disponibility select').val(),
      },
      success: (data) => {
        getCndInfo();
        Toast.fire({
          icon: 'success',
          title:
            'Les informations personnelles ont été mises à jour avec succès',
        });
      },
      error: (xhr, status, error) => {
        console.log(xhr.responseText);
      },
    });
  });

  $('#openQlfHstBtn').click((event) => {
    event.preventDefault();
    if ($('#qlfHstTblArea').attr('hidden') !== undefined) {
      $('#qlfHstTblArea').removeAttr('hidden');
    } else {
      $('#qlfHstTblArea').attr('hidden', true);
    }
  });

  var getAplyQlfHst = (i) => {
    $.ajax({
      type: 'POST',
      url: `/ERP/Recrutement/Candidats/getAplyQlfHst`,
      data: {
        i: i,
      },
      success: (data) => {
        var tbl = '';

        $.each(data, (index, value) => {
          tbl += `<tr>
          <td class="text-center">
              <span>${value.dte.replace('T', ' ').split('.')[0]}</span>
          </td>
          
          <td class="text-center">
          ${value.qlf}
          </td>
          <td class="text-center">
          ${value.qlfBy}
          </td>
        </tr>`;
        });
        // console.log(tbl);

        $('#qlfHstTbl').html(tbl);
      },
      error: (xhr, status, error) => {
        console.log(xhr.responseText);
      },
    });
  };

  $('#Qualification').on('show.bs.modal', function (event) {
    // console.log($(event.relatedTarget).data('id'));
    // console.log($(event.relatedTarget).data('nme'));
    $('#cndQlfTtl').html(`Candidature: ${$(event.relatedTarget).data('nme')}`);

    getAplyQlfHst($(event.relatedTarget).data('id'));

    $('#cndQlf').change(() => {
      // console.log($('#cndQlf').val());
      if ($('#cndQlf').val() == 'Accépter Pour un entretien physique') {
        $('#interviewRow').removeAttr('hidden');
      } else {
        $('#interviewRow').attr('hidden', 'hidden');
      }
    });
    $('#sveCndQlf').click(async () => {
      await $.ajax({
        type: 'POST',
        url: `/ERP/Recrutement/Candidats/sveCndQlf`,
        data: {
          i: $(event.relatedTarget).data('id'),
          q: $('#cndQlf').val(),
          sndMl: $('#sendCnv').is(':checked'),
          d: $('#Date_entretien').val() ? $('#Date_entretien').val() : null,
          c: $('#cndQlfCmnt').val(),
        },
        success: (data) => {
          getApplies();
          getAplyQlfHst($(event.relatedTarget).data('id'));
          $('#Qualification').modal('hide');
          $('#qlfHstTblArea').attr('hidden', true);
          $('#cndQlfCmnt').val('');
          $('#Date_entretien').val('');
          $('#sendCnv').prop('checked', false);
        },
        error: (xhr, status, error) => {
          console.log(xhr.responseText);
        },
      });
    });
  });

  $('#addNewApply').click(async (e) => {
    e.preventDefault();

    await fetch('/ERP/Recrutement/Candidats/getOfrsL', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: ID,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('ERROR');
        }
      })
      .then(async (data) => {
        console.log(data);

        // var t = '';
        // data.forEach((e) => {
        //   t += `<option value="${e.id}">${e.nme}</option>`;
        // });
        var ops = {};
        data.forEach((e) => {
          ops[e.id] = e.nme;
        });
        console.log(ops);

        const { value: ofr } = await Swal.fire({
          title: 'Postuler à une offre',
          input: 'select',
          inputOptions: ops,
          inputPlaceholder: "Sélectionner l'offre",
          showCancelButton: true,
          inputValidator: (value) => {
            return new Promise((resolve) => {
              console.log(value);

              if (value) {
                resolve();
              } else {
                resolve('Vous devez sélectionner une offre :)');
              }
            });
          },
        });
        if (ofr) {
          await fetch('/ERP/Recrutement/Candidats/applyForUsr', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ofr: ofr,
              id: ID,
            }),
          })
            .then((response) => {
              if (response.ok) {
                return response.json();
              } else {
                throw new Error('ERROR');
              }
            })
            .then(async (data) => {
              // Toast.fire({
              //   icon: 'success',
              //   title: '',
              // });
              getApplies();
            });
        }
      });
  });
});
