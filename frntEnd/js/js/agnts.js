var clearInpts = () => {
  $('#').val('');
  $('#').val('');
};
var showHstrDetails = (i, event) => {
  console.log(i);

  event.preventDefault();
  fetch('/ERP/Service-Admin/showHstrDetails', {
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
    .then((data) => {
      console.log(data);
      Swal.fire({
        title: "Détails de l'opération",
        text: data.t,
        icon: 'info',
      });

      // alert("data saved");
    })
    .catch((error) => {
      console.error('Error:', error.message);
    });
};
var fixNull = (n) => {
  return n ? n : '';
};
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
    await fetch('/ERP/Service-Admin/treatTheCnj', {
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
        window.location.reload();
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

var openDCStrWndw = (i) => {
  fetch('/ERP/Service-Admin/openDCStrWndw', {
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
      // $("#trtWindow").html(data);

      // document.getElementById('cnjTreatPopUp').style.display = 'block';
      Swal.fire({
        html: data,
        showCloseButton: true,
        showCancelButton: false,
        showConfirmButton: false,
        focusConfirm: false,
      });
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};

var formatDate = (d) => {
  const currentDate = new Date(d);
  let h = currentDate.getHours();
  return `${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getDate()} ${h.toString().padStart(2, '0')}:${currentDate
    .getMinutes()
    .toString()
    .padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}`;
};
$(document).ready(() => {
  var underCnstrct = `<div style="display: flex; justify-content: center; align-items: center; height: 50vh; width: 100%;"><h1 style='font-size: 4rem;font-family: "Poiret One", cursive;margin-bottom: .5rem;color:red;' class="title">under construction</h1></div>
  `;
  $('#disciplin').html(underCnstrct);
  const urlParams = new URLSearchParams(window.location.search);
  const agentId = urlParams.get('i');

  fetch('/getEnttiesList')
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Error: ${response.statusText}`);
      }
    })
    .then((data) => {
      $('#EntiteX').html(data);
      $('#MEntiteX').html(data);
      $('#NVEntite').html(data);
    })
    .catch((error) => {
      console.error('Fetch error details:', error);
    });
  function formatDate(d) {
    if (d) {
      var date = new Date(d);
      const isOnlyDate =
        date.getHours() === 0 &&
        date.getMinutes() === 0 &&
        date.getSeconds() === 0;

      const pad = (n) => n.toString().padStart(2, '0');
      const day = pad(date.getDate());
      const month = pad(date.getMonth() + 1);
      const year = date.getFullYear();

      if (isOnlyDate) {
        return `${day}/${month}/${year}`;
      }

      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      const seconds = pad(date.getSeconds());
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } else {
      return 'N/A';
    }
  }
  var getInfo = () => {
    fetch('/ERP/Service-Admin/getUsrInfos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        i: agentId,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Error: ${response.statusText}`);
        }
      })
      .then((dd) => {
        var data = dd.data;

        document.getElementById(
          'clbPic'
        ).src = `./rcs/ProfilePics/${data.id}.${data.picExt}`;
        document.getElementById(
          'theBigPic'
        ).src = `./rcs/ProfilePics/${data.id}.${data.picExt}`;
        document.title = `${data.fname} ${data.lname}`;
        $('#agNme').html(`${data.fname} ${data.lname}`);
        $('#mtrcl').html(`${data.matricule}`);
        $('#entty').html(`${data.actualEntity}`);
        $('#dprt').html(`${data.department}`);
        if (data.isRsp) {
          $('#dprt').html(`${$('#dprt').html()} (Resposable)`);
          // $('#isResponsableCheckBox').prop('checked', true);
          // // $("#isResponsableCheckBox").prop("desabled", true);
          // document.getElementById('isResponsableCheckBox').disabled = true;
        }
        $('#pst').html(`${data.jobeTitle}`);
        // $('#stts').html(`${data.activeStatus}`);
        $('#stts').html(
          `<span style="color: red; cursor: not-allowed;">${data.activeStatus}</span>`
        );
        if (data.activeStatus == 'Active') {
          $('#stts').html(
            `<span style="color: green; text-decoration: underline; cursor: pointer;" id="actvUsrBtn">Active</span>`
          );
          $('#actvUsrBtn').click(() => {
            makeUsrNoActive();
          });
        }

        $('#PremiereDatedintégration').html(
          `${formatDate(data.firstIntegrationDate)}`
        );
        $('#Datedederniertransfert').html(`${data.integrationDate}`);

        $('#cntrctTpe').html(`${data.contractTpe}`);
        $('#cnjSld').html(`${data.soldCnj}`);
        $('#a9dmiya').html(`${data.a9damiya}`);

        $('#mtrclEdtTxt').val(`${fixNull(data.matricule)}`);
        $('#CNSSEdtTxt').val(`${fixNull(data.CNSS)}`);
        $('#assurCmpnyEdtTxt').val(`${fixNull(data.ansuranceCmpny)}`);
        $('#assrAffiliateNmbrEdtTxt').val(
          `${fixNull(data.ansuranceAffiliationNmber)}`
        );
        $('#CivilitEdtTxt').val(`${fixNull(data.sex)}`);
        $('#NomEdtTxt').val(`${fixNull(data.lname)}`);
        $('#PrenomEdtTxt').val(`${fixNull(data.fname)}`);
        $('#naissanceEdtTxt').val(`${fixNull(data.bd)}`);
        $('#NationalitEdtTxt').val(`${fixNull(data.nationality)}`);
        $('#CINedtTxt').val(`${fixNull(data.CIN)}`);
        $('#SfamilialeEdtTxt').val(`${fixNull(data.famlyStts)}`);
        $('#enfantsEdtTxt').val(`${fixNull(data.childrenNmber)}`);
        $('#CtyEdtTxt').val(`${fixNull(data.city)}`);
        $('#zipEdtTxt').val(`${fixNull(data.zip)}`);
        $('#AdresseEdtTxt').val(`${fixNull(data.adress)}`);
        $('#lnkdinEdtTxt').val(`${fixNull(data.linkedin)}`);
        $('#Tel1EdtTxt').val(`${fixNull(data.phone)}`);
        $('#tel2EdtTxt').val(`${fixNull(data.phone2)}`);
        $('#mailEdtTxt').val(`${fixNull(data.email)}`);
        $('#BankNmeEdtTxt').val(`${fixNull(data.bankName)}`);
        $('#AgenceBankEdtTxt').val(`${fixNull(data.bankAgence)}`);
        $('#ribEdtTxt').val(`${fixNull(data.RIB)}`);
        $('#soldConge').val(`${fixNull(data.soldCnj)}`);
        $('#cmnts').val(`${fixNull(data.cmnt)}`);

        $('#dprtsX').html('');
        $('#MdprtsX').html('');
        var dprts = dd.dprts;
        dprts.forEach((d) => {
          $('#dprtsX').html(
            $('#dprtsX').html() + `<option value="${d.id}">${d.nme}</option>`
          );
          $('#MdprtsX').html(
            $('#MdprtsX').html() + `<option value="${d.id}">${d.nme}</option>`
          );
        });
        $('#etblsmt').html(data.etablissment);
        $('#dprtsX').val(data.dprtId);
        $('#MdprtsX').val(data.dprtId);
        $('#EntiteX').val(data.entitytId);
        $('#EtablissementX').val(data.etablissment);
        $('#PosteX').val(data.jobeTitle);
        $('#TypeContratX').val(data.contractTpe);
        // var date = new Date(data.integrationDate);
        // var day = ('0' + date.getDate()).slice(-2);
        // var month = ('0' + (date.getMonth() + 1)).slice(-2);
        // var formattedDate = date.getFullYear() + '-' + month + '-' + day;

        // $('#intégrationX').val(formattedDate);
        // $('#fincontratX').val(data.leaveDate);
        // $('#NomUserX').html(`${data.fname} ${data.lname}`);
        $('#DepartementX').html(data.department);
        // $('#DepartementX').html(data.department);
        // $('#StatutX').val(data.stts);
        $('#sx').html(data.sex);

        if (dd.mdfFUserPrm == 0) {
          $('#mdfPersoInfosBtn').attr('hidden', true);
          // $('#actvUsrBtn').attr('disabled', true);
          $('#actvUsrBtn').off('click');
          $('#actvUsrBtn').attr('href', '#');
          $('#actvUsrBtn').css('cursor', 'not-allowed');
          $('#actvUsrBtn').attr(
            'title',
            "Vous n'avez pas la permission de changer"
          );
        }

        // $('#').val(`${fixNull(data.)}`);
        // $('#').val(`${fixNull(data.)}`);
        // $('#').val(`${fixNull(data.)}`);
        // $('#').val(`${fixNull(data.)}`);
        // $('#').val(`${fixNull(data.)}`);
        // $('#').val(`${fixNull(data.)}`);
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });
  };
  var getAllHstr = () => {
    fetch('/ERP/Service-Admin/getHstrs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        i: agentId,
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
        $('#hstrTbl').html(data.t);
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });
  };
  getAllHstr();
  var getCntrctTrHstry = () => {
    fetch('/ERP/Service-Admin/getAllTrsfCntrTble', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        i: agentId,
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
        // console.log(data);

        if (data.d == 'null') {
          // fetch('err500small.html')
          //   .then(function (response) {
          //     if (!response.ok) {
          //       throw new Error('Network response was not ok');
          //     }
          //     return response.text();
          //   })
          //   .then(function (content) {
          //     $('#cntrsContainer').html(content);
          //   })
          //   .catch(function (error) {
          //     console.error(
          //       'There was a problem with the fetch operation:',
          //       error
          //     );
          //   });
          $('#cntrsContainer')
            .html('<img src="403.gif"   width="70%" height="70%">')
            .fadeIn();
        } else {
          $('#allTrsfCntrTble').html(data.d);
          if (data.add == 0) {
            $('#addCntrBtn').attr('hidden', true);
          }
        }
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });
  };

  var getConjeTble = () => {
    fetch('/ERP/Service-Admin/getCnjTble', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        i: agentId,
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
        if (data.t == '0') {
          // fetch('err500small.html')
          //   .then(function (response) {
          //     if (!response.ok) {
          //       throw new Error('Network response was not ok');
          //     }
          //     return response.text();
          //   })
          //   .then(function (content) {
          //     $('#cnjContainer').html(content);
          //   })
          //   .catch(function (error) {
          //     console.error(
          //       'There was a problem with the fetch operation:',
          //       error
          //     );
          //   });
          $('#cnjContainer')
            .html('<img src="403.gif"   width="70%" height="70%">')
            .fadeIn();
        } else {
          $('#cnjTbl').html(data.t);
        }

        if (data.s == 0) {
          $('#mdfCnjBtn').attr('hidden', true);
        }
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });
  };

  function getDplcmTble() {
    fetch('/ERP/Service-Admin/getDplcmTble', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        i: agentId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error(data.error);
        } else {
          if (data.access) {
            $('#dplcmTbl').html(data.t);
          } else {
            $('#Deplacemnts').html('<img src="403.gif">').fadeIn();
          }
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  getDplcmTble();

  var getDCSreqTble = () => {
    fetch('/ERP/Service-Admin/getDCSreqTble', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        i: agentId,
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
        if (data.access) {
          $('#DCsRqTbl').html(data.t);
        } else {
          $('#Documents').html('<img src="403.gif">').fadeIn();
        }
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });
  };

  var getDchrgeTble = () => {
    fetch('/ERP/Service-Admin/getDchrgeTble', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        i: agentId,
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
        if (data.access) {
          // await fetch('err500small.html')
          //   .then(function (response) {
          //     if (!response.ok) {
          //       throw new Error('Network response was not ok');
          //     }
          //     return response.text();
          //   })
          //   .then(function (content) {
          //     $('#dchrgContainer').html(content);
          //   })
          //   .catch(function (error) {
          //     console.error(
          //       'There was a problem with the fetch operation:',
          //       error
          //     );
          //   });

          $('#dchrgeTble').html(data.t);
        } else {
          $('#Decharges').html('<img src="403.gif"   width="100%">').fadeIn();
        }
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });
  };

  getDchrgeTble();
  getConjeTble();
  getDCSreqTble();
  getCntrctTrHstry();
  if (!agentId) {
    window.location.href = `/ERP/Service-Admin/Liste-des-Collaborateurs`;
  } else {
  }
  getInfo();
  $('#mdfPersoInfosBtn').click(() => {
    if (
      $('#NomEdtTxt').val() &&
      $('#PrenomEdtTxt').val() &&
      $('#CINedtTxt').val() &&
      $('#mailEdtTxt').val()
    ) {
      var chldrn = 0;
      if ($('#enfantsEdtTxt').val()) {
        chldrn = $('#enfantsEdtTxt').val();
      }
      fetch('/ERP/Service-Admin/updatePersoInfoUsr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agId: agentId,
          a: $('#mtrclEdtTxt').val(),
          b: $('#CNSSEdtTxt').val(),
          c: $('#assurCmpnyEdtTxt').val(),
          d: $('#assrAffiliateNmbrEdtTxt').val(),
          e: $('#CivilitEdtTxt').val(),
          f: $('#NomEdtTxt').val(),
          g: $('#PrenomEdtTxt').val(),
          h: $('#naissanceEdtTxt').val(),
          i: $('#NationalitEdtTxt').val(),
          j: $('#CINedtTxt').val(),
          k: $('#SfamilialeEdtTxt').val(),
          l: chldrn,
          m: $('#CtyEdtTxt').val(),
          n: $('#zipEdtTxt').val(),
          o: $('#AdresseEdtTxt').val(),
          p: $('#lnkdinEdtTxt').val(),
          q: $('#Tel1EdtTxt').val(),
          r: $('#tel2EdtTxt').val(),
          s: $('#mailEdtTxt').val(),
          t: $('#BankNmeEdtTxt').val(),
          u: $('#AgenceBankEdtTxt').val(),
          v: $('#ribEdtTxt').val(),
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
          //
          Swal.fire({
            // title: "Good job!",
            text: `Les informations personnelles de ${$(
              '#PrenomEdtTxt'
            ).val()} ${$('#NomEdtTxt').val()} ont été modifiées avec succès.`,
            icon: 'success',
          });
          getInfo();
          getAllHstr();

          // alert("data saved");
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

  $('#isClosedZ').on('change', () => {
    if ($('#isClosedZ:checked').val()) {
      $('#cntrClosinInfos').removeAttr('hidden');
    } else {
      $('#cntrClosinInfos').attr('hidden', 'hidden');
    }
  });

  $('#sveNewCntrTrnsfBtn').click(() => {
    if ($('#dateTransfertZ').val()) {
      if (
        $('#isClosedZ:checked').val() &&
        (!$('#ClsdDate').val() || !$('#IntgrDteZ').val())
      ) {
        Toast.fire({
          icon: 'error',
          title: 'Veuillez remplir tous les champs.',
        });
        return false;
      }
      fetch('/ERP/Service-Admin/saveNewTrsfrCntr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agId: agentId,
          a: $('#NVEntite').val(),
          b: $('#EtablissementZ').val(),
          c: $('#dateTransfertZ').val(),
          d: $('#NvPosteZ').val(),
          e: $('#isClosedZ:checked').val(),
          f: $('#ClsdDate').val(),
          g: $('#IntgrDteZ').val(),
          h: $('#cntrTpeZ').val(),
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
          getAllHstr();

          getCntrctTrHstry();
          Swal.fire({
            title: 'Good job!',
            text: `Le nouveau transfert de contrat de ${$(
              '#PrenomEdtTxt'
            ).val()} ${$('#NomEdtTxt').val()} a été enregistré.`,
            icon: 'success',
          });
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

  $('#mdfCnjBtn').click(async () => {
    // var nsld = prompt("Sold de Conje : ");
    //   const { value: formValues } = await Swal.fire({
    //     title: "Multiple inputs",
    //     html: `
    //   <input id="swalinptSldCnj" class="swal2-input">
    // `,
    //     focusConfirm: false,
    //     preConfirm: () => {
    //       return document.getElementById("swalinptSldCnj").value;
    //     },
    //   });
    //   if (formValues) {
    //     Swal.fire(formValues);
    //   } else {
    //     Swal.fire("nulllllll ", "", "error");
    //   }

    const { value: nsld } = await Swal.fire({
      title: `Mise à jour des jours de congé restants pour ${$(
        '#PrenomEdtTxt'
      ).val()} ${$('#NomEdtTxt').val()}.`,
      input: 'number',

      inputPlaceholder: 'Entrez le nouveau solde en jours.',
      inputAttributes: {},
      inputValidator: (value) => {
        if (!value || value > 35 || value < 0) {
          return 'Cette valeur doit être comprise entre 0 et 35.';
        }
      },
    });

    if (nsld) {
      // var cnfrm = confirm(
      //   "Are u sure you want to change the sold conje of this user ?"
      // );
      Swal.fire({
        title: `Êtes-vous sûr de vouloir modifier le solde de congé de ${$(
          '#PrenomEdtTxt'
        ).val()} ${$('#NomEdtTxt').val()} ?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: 'Oui',
      }).then((result) => {
        if (result.isConfirmed) {
          fetch('/ERP/Service-Admin/changeSoldCnj', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              i: agentId,
              c: nsld,
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
              Toast.fire({
                icon: 'success',
                title: `Le nouveau solde de jours de congé est de ${nsld} jours`,
              });
              getInfo();
              getAllHstr();
            })
            .catch((error) => {
              console.error('Error:', error.message);
              Toast.fire({
                icon: 'error',
                title: `error.message`,
              });
            });
        }
      });
    }
  });

  $('#EdtCntrSveBtn').click(() => {
    $('#EdtCntrSveBtn').attr('hidden', true);
    if ($('#PosteX').val() && $('#intégrationX').val() && $('#EntiteX').val()) {
      $.ajax({
        type: 'POST',
        url: '/ERP/Service-Admin/sveNewCntrct',
        data: {
          i: agentId,
          s: $('#CntrctStts').val(),
          e: $('#EtablissementX').val(),
          ent: $('#EntiteX').val(),
          d: $('#dprtsX').val(),
          pst: $('#PosteX').val(),
          cntrtpe: $('#newCntrTpe').val(),
          startDte: $('#intégrationX').val(),
          tpe: $('#newCntrTpe').val(),
          endDte: $('#fincontratX').val(),
          ClsdDate: $('#ClsdDateOld').val(),
          clsed: $('#isClosedZ').is(':checked'),
          closeReason: $('#clsMtf').val(),
        },
        success: (data) => {
          $('#ClsdDate').val('');
          getCntrctTrHstry();
          getAllHstr();
          getInfo();
          $('#cntrClosinInfos').attr('hidden', true);
          $('#isClosedZ').prop('checked', false);

          Toast.fire({
            icon: 'success',
            title: `Le contrat a été enregistré avec succès`,
          });

          $('#clsBtn').click();
        },
        error: (xhr, status, error) => {
          console.log(xhr.responseText);
        },
      });
    } else {
      Swal.fire({
        title: `Veuillez remplir toutes les informations obligatoires.`,
        icon: 'error',
      });
    }
    $('#EdtCntrSveBtn').removeAttr('hidden');
  });

  $('#TraitementContrat').on('show.bs.modal', function (event) {
    $('#newCntrTpe').change(() => {
      if ($('#newCntrTpe').val() == 'CDI') {
        $('#endCntrDte').attr('hidden', true);
      } else {
        $('#endCntrDte').removeAttr('hidden');
      }
    });
    fetch(`/ERP/Service-Admin/checkCntrcts?i=${agentId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        switch (data) {
          case 0:
            $('#cntrSttsDv').attr('hidden', true);
            break;

          default:
            $('#cntrSttsDv').removeAttr('hidden');
        }
      })
      .catch((error) => console.error('Error:', error));
  });

  var makeUsrNoActive = () => {
    Swal.fire({
      title: 'Enter Details',
      html: `
        <div class="row" >
                                  <!--hidden if checkbox = False -->
                                  <div class="col-md-6">
                                    <div class="form-group">
                                      <label for="Statut">Date clôture *</label>
                                      <input
                                        type="date"
                                        class="form-control"
                                        name="Datecloture"
                                        id="cutCntrDte"
                                      />
                                    </div>
                                  </div>
                                  <div class="col-md-6">
                                    <div class="form-group">
                                      <label for="Statut"
                                        >Motif de clôture *</label
                                      >
                                      <select
                                        class="form-control"
                                        id="cutCntrMtf"
                                        name="clsMtf"
                                      >
                                      <option value="" hidden>Choisissez un motif</option>
                                      <option value="FIN DE CONTRAT">FIN DE CONTRAT</option>
                                        <option value="Rupture">Rupture</option>
                                        <option value="Licenciement">
                                          Licenciement
                                        </option>
                                        <option value="Démission">
                                          Démission
                                        </option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const cutCntrDte = $('#cutCntrDte').val();
        const cutCntrMtf = $('#cutCntrMtf').val();
        if (!cutCntrDte || !cutCntrMtf) {
          Swal.showValidationMessage('Veuillez remplir les deux champs');
          return false;
        }
        return { cutCntrDte, cutCntrMtf };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { cutCntrDte, cutCntrMtf } = result.value;
        Swal.fire(`You selected: ${cutCntrDte} and ${cutCntrMtf}`);
        $.ajax({
          type: 'POST',
          url: '/ERP/Service-Admin/cutCntr',
          data: {
            i: agentId,
            d: cutCntrDte,
            m: cutCntrMtf,
          },
          success: (data) => {
            getCntrctTrHstry();
            getAllHstr();
            getInfo();

            Swal.fire({
              title: `l'opération a réussi.`,
              icon: 'success',
            });
          },
          error: (xhr, status, error) => {
            console.log(xhr.responseText);
          },
        });
      }
    });
  };

  $('#MdfContrat').on('show.bs.modal', function (event) {
    var cntrId = $(event.relatedTarget).data('id');

    $('#cntrID').html(cntrId);

    fetch(`/ERP/Service-Admin/getCntrDetails?i=${cntrId}`)
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        $('#MCntrctStts').val(data.stts);
        $('#MEtablissementX').val(data.etablissement);
        $('#MEntiteX').val(data.entty);
        $('#MPosteX').val(data.pst);
        if (data.dteIntgr) {
          var date = new Date(data.dteIntgr);
          var day = ('0' + date.getDate()).slice(-2);
          var month = ('0' + (date.getMonth() + 1)).slice(-2);
          var formattedDate = date.getFullYear() + '-' + month + '-' + day;
          $('#MintégrationX').val(formattedDate);
        }
        $('#MnewCntrTpe').val(data.tpe);
        if (data.endDte) {
          var date = new Date(data.endDte);
          var day = ('0' + date.getDate()).slice(-2);
          var month = ('0' + (date.getMonth() + 1)).slice(-2);
          var formattedDate = date.getFullYear() + '-' + month + '-' + day;
          $('#MfincontratX').val(formattedDate);
        }
      })

      .catch((error) => console.error('Error:', error));

    $('#EdtCntrBtn').click(() => {
      console.log('clicked');

      fetch('/ERP/Service-Admin/edtCntr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          i: cntrId,
          stts: $('#MCntrctStts').val(),
          etb: $('#MEtablissementX').val(),
          entt: $('#MEntiteX').val(),
          pst: $('#MPosteX').val(),
          intgrDte: $('#MintégrationX').val(),
          tpe: $('#MnewCntrTpe').val(),
          endDte: $('#MfincontratX').val(),
          dprt: $('#MdprtsX').val(),
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
          console.log('saved :', data);

          $('#MclsBtn').click();
          Toast.fire({
            icon: 'success',
            title: `Le contrat ${cntrId} ont été mis à jour avec succès`,
          });
          getCntrctTrHstry();
          getAllHstr();
          getInfo();
        })
        .catch((error) => {
          console.error('Error:', error.message);
          Toast.fire({
            icon: 'error',
            title: `error.message`,
          });
        });
    });
  });

  $('#AddCmntBtn').click(async (e) => {
    e.preventDefault();
    const { value: text } = await Swal.fire({
      input: 'textarea',
      inputLabel: 'Ajouter un nouveau commentaire',
      inputPlaceholder: 'Tapez votre commentaire ici...',
      inputAttributes: {
        'aria-label': 'Tapez votre commentaire ici',
      },
      showCancelButton: true,
    });
    if (text) {
      Toast.fire({
        icon: 'success',
        title: `Le commentaire a été enregistré avec succès`,
      });
      await fetch(`/ERP/Service-Admin/newCmnt?t=${text.trim()}&a=${agentId}`);
      $('#cmnts').val($('#cmnts').val() + `* ${text.trim()}.\n`);
      getAllHstr();
    }
  });
});
