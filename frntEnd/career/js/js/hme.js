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
  var isDateBetween = (dateToCheck, startDate, endDate) => {
    const checkDate = new Date(dateToCheck);
    const start = new Date(startDate);
    const end = new Date(endDate);

    return checkDate >= start && checkDate <= end;
  };

  var today = new Date().toISOString().split('T')[0];

  let getOffres = () => {
    var qrs = [];
    if ($('#Ffuncx').val()) {
      qrs.push(`f=${$('#Ffuncx').val().replaceAll(' ', '|')}`);

      $('#FltrFfuncxCls').removeAttr('hidden');
      $('#FltrFfuncxLabel').html($('#Ffuncx').val());
    }
    if ($('#Frgn').val()) {
      qrs.push(`r=${$('#Frgn').val().replaceAll(' ', '|')}`);

      $('#FltrFrgnCls').removeAttr('hidden');
      $('#FltrFrgnLabel').html($('#Frgn').val());
    }
    if ($('#Fcle').val()) {
      qrs.push(`c=${$('#Fcle').val().replaceAll(' ', '|')}`);

      $('#FltrFcleCls').removeAttr('hidden');
      $('#FltrFcleLabel').html($('#Fcle').val());
    }

    if ($('#Fslr').val()) {
      qrs.push(`s=${$('#Fslr').val().replaceAll(' ', '|')}`);

      $('#FltrFslrCls').removeAttr('hidden');
      $('#FltrFslrLabel').html($('#Fslr').val());
    }
    if ($('#FSctr').val()) {
      qrs.push(`sctr=${$('#FSctr').val().replaceAll(' ', '|')}`);

      $('#FltrFSctrCls').removeAttr('hidden');
      $('#FltrFSctrLabel').html($('#FSctr').val());
    }
    if ($('#Fexcpr').val()) {
      qrs.push(`exp=${$('#Fexcpr').val().replaceAll(' ', '|')}`);
      $('#FltrFexcprCls').removeAttr('hidden');
      $('#FltrFexcprLabel').html($('#Fexcpr').val());
    }
    if ($('#Fetd').val()) {
      qrs.push(`etd=${$('#Fetd').val().replaceAll(' ', '|')}`);
      $('#FltrFetdCls').removeAttr('hidden');
      $('#FltrFetdLabel').html($('#Fetd').val());
    }
    if ($('#Frmtion').val()) {
      qrs.push(`frmtion=${$('#Frmtion').val().replaceAll(' ', '|')}`);
      $('#FltrFrmtionCls').removeAttr('hidden');
      $('#FltrFrmtionLabel').html($('#Frmtion').val());
    }
    // console.log(`/getOffres${qrs ? `?${qrs.join("&")}` : ""}`);

    fetch(`/Career/getOffres${qrs ? `?${qrs.join('&')}` : ''}`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Error: ${response.statusText}`);
        }
      })
      .then((data) => {
        var tbl = ``;
        data.forEach((e) => {
          tbl += `
            <div class="single-post d-flex flex-row">
              <div class="details" style="width:100%">
                <div class="title d-flex flex-row justify-content-between">
                  <div class="titles">
                    <a href="/Career/Offer/${e.uniqId}"
                      ><h4>
                        ${e.nme}
                        <span
                          id="StatutOffre"
                          Name="StatutOffre"
                          class="text-danger"
                          >${
                            isDateBetween(
                              today,
                              e.startDte.split('T')[0],
                              e.endDte.split('T')[0]
                            )
                              ? ''
                              : 'Expiré'
                          }</span
                        >
                      </h4>
                      </a>
                  </div>
                  <ul class="btns" style="">
                    <li><a href="/Career/Offer/${
                      e.uniqId
                    }">Détail de l'offre</a></li>
                  </ul>
                </div>
                <p>
                 ${e.cmpny}
                </p>
                <h6>
                  Publication : du
                  <span id="startdate" name="startdate" class="text-primary"
                    >${e.startDte.split('T')[0]}</span
                  >
                  au
                  <span id="enddate" name="enddate" class="text-primary"
                    >${e.endDte.split('T')[0]}</span
                  >
                </h6>
                <h6>
                  Région:
                  <span id="region" name="region"
                    >${e.place},
                    <span id="City" name="City">${e.city}</span></span
                  >
                </h6>
                <h6>
                  Mode de travail : <span Id="wrkTpe" name="wrkTpe"></span> ${
                    e.wrkTpe
                  }
                </h6>
                <h6>
                  Salaire: <span Id="salary" name="salary"></span> ${e.salair}
                </h6>
                <h6>
                  Secteur: <span Id="Secteur" name="Secteur"></span>${e.sector}
                </h6>
                <h6>
                  Fonction:
                  <span Id="Fonction" name="Fonction"></span>${e.fonctions}
                </h6>
              </div>
            </div>
        `;
        });
        tbl += `<a class="text-uppercase loadmore-btn mx-auto d-block" href="#"
              >Voir Plus d'offres</a
            >`;

        $('#offersDev').html(tbl);
      })
      .catch((error) => {
        console.error('Fetch error details:', error);
      });
  };

  getOffres();
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

  $(`#searchBtn`).click(() => {
    getOffres();
  });

  $(`#fltrBtn`).click(() => {
    getOffres();
  });

  var changeSelect = (id, value) => {
    $(`#${id}Div select`).val(value).change();
    $(`#${id}Div .nice-select`).find('.current').text(value);
    $(`#${id}Div .nice-select`).find('.option').removeClass('selected');
    $(`#${id}Div .nice-select`)
      .find(`.option[data-value="${value}"]`)
      .addClass('selected');
  };
  $('#clearFilters').click(function (event) {
    event.preventDefault();
    changeSelect('Fslr', '');
    changeSelect('Ffuncx', '');
    changeSelect('Frgn', '');
    changeSelect('FSctr', '');
    changeSelect('Fexcpr', '');
    changeSelect('Fetd', '');
    $('#Fcle').val('');
    getOffres();
    changeSelect('Frmtion', '');
    $('.FltrLbls').html('Tous');
  });

  $('.clsFltr').click(function () {
    if ($(this).data('ii') == 'Fcle') {
      $('#Fcle').val('');
    } else {
      changeSelect($(this).data('ii'), '');
    }

    $(`#Fltr${$(this).data('ii')}Label`).html('Tous');
    $(`#Fltr${$(this).data('ii')}Cls`).attr('hidden', true);
    getOffres();
  });
});
