console.error = function () {};
console.warn = function () {};
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

function dispoCounter() {
  if ($('#brstart').html()) {
    // const currentDate = new Date($("#timeLabel").html());
    // let h = currentDate.getHours() + 1;
    // const formattedTime = `${currentDate.getFullYear()}-${
    //   currentDate.getMonth() + 1
    // }-${currentDate.getDate()} ${h.toString().padStart(2, "0")}:${currentDate
    //   .getMinutes()
    //   .toString()
    //   .padStart(2, "0")}:${currentDate
    //   .getSeconds()
    //   .toString()
    //   .padStart(2, "0")}`;
    // const date1 = new Date(`${formattedTime}`);
    // const date2 = new Date(`${$("#brstart").html()}`);
    // const timeDifference = date1 - date2;
    // const diffDate = new Date(timeDifference);
    // const diffHours = diffDate.getUTCHours().toString().padStart(2, "0");
    // const diffMinutes = diffDate.getUTCMinutes().toString().padStart(2, "0");
    // const diffSeconds = diffDate.getUTCSeconds().toString().padStart(2, "0");
    const endDate = new Date($('#timeLabel2').html());
    const startDate = new Date($('#brstart').html());
    const diffInMs = Math.abs(endDate - startDate);

    const hours =
      Math.floor(diffInMs / (1000 * 60 * 60)).toString().length > 1
        ? Math.floor(diffInMs / (1000 * 60 * 60))
        : Math.floor(diffInMs / (1000 * 60 * 60))
            .toString()
            .padStart(2, '0');
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60))
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000)
      .toString()
      .padStart(2, '0');

    // const duration = moment
    //   .tz($("#timeLabel").html(), "Africa/Casablanca")
    //   .diff(moment.tz($("#brstart").html(), "Africa/Casablanca"));

    // const hours = Math.floor(duration / (1000 * 60 * 60));
    // const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    // const seconds = Math.floor((duration % (1000 * 60)) / 1000);
    // return `${hours.toString().padStart(2, "0")}:${minutes
    //   .toString()
    //   .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    // var today = new Date();
    //     var h = today.getHours();
    //     var m = today.getMinutes();
    //     var s = today.getSeconds();

    //     m = checkTime(m);
    //     s = checkTime(s);

    //     const date1 =  new Date(`${$('#timeLabel').html()}`);
    //     console.log(`${$('#timeLabel').html()} - ${$('#brstart').html()}`);
    //     const date2 =  new Date(`${$('#brstart').html()}`);
    //     const timeDifference = date2 - date1;
    //     const diffDate = new Date(timeDifference);
    //     const diffHours = diffDate.getUTCHours().toString().padStart(2, '0');
    //     const diffMinutes = diffDate.getUTCMinutes().toString().padStart(2, '0');
    //     const diffSeconds = diffDate.getUTCSeconds().toString().padStart(2, '0');
    //     const durt = `${diffHours}:${diffMinutes}:${diffSeconds}`;

    // const startTime = new Date(`1998-08-23T${$('#brstart').html()}`);
    // const endTime = new Date(`1998-08-23T${$('#timeLabel').html()}`);

    // // Calculate the difference in milliseconds
    // const timeDifference = endTime - startTime;

    // Convert the difference to a more human-readable format (e.g., hours, minutes, seconds)
    // const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    // const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    // const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    $('#dispoBtn').html(`Dispo ${hours}:${minutes}:${seconds}`);
  }
  t = setTimeout(function () {
    dispoCounter();
  }, 500);
}

fetch('/getDprtmList')
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

function getAllBrks() {
  fetch('/WFM/getAllBrks')
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        alert('error');
        throw new Error(`Error: ${response.statusText}`);
      }
    })
    .then((data) => {
      var tbl = `<table class="table table-borderless">
            <thead>
              <tr>
                <th class="pl-0">Pause</th>
                <th class="pl-0">Duré</th>
                <th class="pl-0">Heure</th>
              </tr>
            </thead>
            <tbody>`;
      var stl = '';
      data.forEach((item) => {
        // var d = item.drtion;

        // if (
        //   d.split(":")[1] != "null" &&
        //   item.mxDr != "null" &&
        //   d.split(":")[1] > item.mxDr
        // ) {
        //   stl = 'style="color:red"';
        // }
        tbl += `<tr >
                <td class="pl-0">${item.breakName}</td>
                <td class="pl-0">${item.drtion ? item.drtion : ''}</td>
                <td class="text-muted pl-0">${
                  item.strt.split('T')[1].split('.')[0]
                } - ${
          item.fnsh ? item.fnsh.split('T')[1].split('.')[0] : ''
        }</td>
              </tr>`;
      });
      tbl += `</tbody>
            </table>`;

      $('#allBrksDiv').html(tbl);
    })
    .catch((error) => {
      console.error('Error:', error.message);
    });
}

var getBrksCodeTble = () => {
  fetch('/WFM/getBrksCodeTble', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Error: ${response.statusText}`);
      }
    })
    .then((data) => {
      var tble = '';
      data.forEach((e) => {
        tble += `
                    <tr>
                    <td><a href="#">${e.nme}</a></td>
                    <td>${e.maxDrtion}</td>
                    <td>${'Oui' ? e.requireValidation == 1 : 'Non'}</td>
                    <td>${'Oui' ? e.splitable == 1 : 'Non'}</td>
                    <td><button type="button"  onclick="removeBrkCde(${
                      e.id
                    })" class="btn btn-outline-danger btn-rounded btn-icon"><i class="mdi mdi-close"></i></button></td>
                  </tr>
                    `;
      });
      $('#BrksCdeTble').html(tble);
    })
    .catch((error) => {
      console.error('Error:', error.message);
    });
};

var removeBrkCde = (i) => {
  if (i) {
    if (confirm('are you sure you want to remove the break code ?')) {
      fetch('/WFM/rmBrCde', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ i: i }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Error: ${response.statusText}`);
          }
        })
        .then((data) => {
          getBrksCodeTble();
        })
        .catch((error) => {
          console.error('Error:', error.message);
        });
    }
  }
};

var getWfmBreaksCodes = () => {
  fetch('/WFM/getWfmBreaksCodes')
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        alert('error');
        throw new Error(`Error: ${response.statusText}`);
      }
    })
    .then((data) => {
      // console.log(data);

      $('#brksList').html(data.o);
    })
    .catch((error) => {
      console.error('Error:', error.message);
    });
};

$(document).ready(() => {
  getAllBrks();
  getBrksCodeTble();
  getWfmBreaksCodes();

  const socket = io();

  function checkActiveBrk() {
    fetch('/WFM/checkActiveBrk')
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          $('#dispoBtn').attr('hidden', 'hidden');
          throw new Error(`Error: ${response.statusText}`);
        }
      })
      .then((data) => {
        if (data.message == '0') {
          $('#dispoBtn').attr('hidden', 'hidden');
          $('#brChangeBtn').removeAttr('hidden');
          $('#brksList').removeAttr('disabled');
        } else {
          $('#brksList').val(data.brk);
          $('#brstart').html(data.strt);
          $('#brksList').attr('disabled', 'disabled');
          $('#brChangeBtn').attr('hidden', 'hidden');
          $('#dispoBtn').removeAttr('hidden');
          dispoCounter();
          getAllBrks();
        }
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });

    // t = setTimeout(function () {
    //   checkActiveBrk();
    // }, 500);
  }

  checkActiveBrk();
  dispoCounter();

  var getAllAttrBrkForDprt = () => {
    if ($('#Departement').val()) {
      fetch('/WFM/getAttBrksCdes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ i: $('#Departement').val() }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            alert('error');
            throw new Error(`Error: ${response.statusText}`);
          }
        })
        .then((data) => {
          var tbl = '';
          data.forEach((e) => {
            tbl += `
                  <tr>
                        <td>${e.bnme}</td>
                        <td>${e.drt}</td>
                      </tr>
                      `;
          });

          $('#brksAttrTblTtle').html(
            `Liste des pauses déja attribuer pour le service : ${$(
              '#Departement option:selected'
            ).text()}`
          );
          getBrListAttr();
          $('#attBrksTble').html(tbl);
        })
        .catch((error) => {
          console.error('Error:', error.message);
        });
    } else {
      $('#brksAttrTblTtle').html(
        `Veuillez sélectionner un département pour voir ses codes pauses`
      );
      $('#attBrksTble').html('');
      $('#lstBreaks').html('');
    }
  };
  var getBrListAttr = () => {
    if ($('#Departement').val()) {
      fetch('/WFM/getBrksCodeTble', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ d: $('#Departement').val() }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            alert('error');
            throw new Error(`Error: ${response.statusText}`);
          }
        })
        .then((data) => {
          var ps = '';
          data.forEach((e) => {
            ps += `<option value="${e.id}">${e.nme}</option>`;
          });
          $('#lstBreaks').html(ps);
        })
        .catch((error) => {
          console.error('Error:', error.message);
        });
    }
  };

  $('#brksList').on('change', () => {
    if ($('#brksList').val()) {
      $('#brChangeBtn').removeAttr('disabled');
    } else {
      $('#brChangeBtn').attr('disabled', 'disabled');
    }
  });

  $('#brChangeBtn').click(async () => {
    if ($('#brksList').val()) {
      fetch('/WFM/saveBr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brk: $('#brksList').val() }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Error: ${response.statusText}`);
          }
        })
        .then((data) => {
          $('#brstart').html(data.s);
          $('#brChangeBtn').attr('hidden', 'hidden');
          $('#brksList').attr('disabled', 'disabled');
          $('#dispoBtn').removeAttr('hidden');
          $('#dispoBtn').html('Dispo 00:00:00');
          checkActiveBrk();
          dispoCounter();
        })
        .catch((error) => {
          console.error('Error:', error.message);
        });
    }
  });

  $('#dispoBtn').click(() => {
    fetch('/WFM/dispo')
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          alert('error');
          throw new Error(`Error: ${response.statusText}`);
        }
      })
      .then((data) => {
        $('#brksList').val('');
        $('#brksList').removeAttr('disabled');
        $('#brstart').html('');
        checkActiveBrk();
        getAllBrks();
        getWfmBreaksCodes();
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });
  });

  $('#addBrkBtn').click(() => {
    if (
      $('#brkNme').val() &&
      $('#DureePause').val() &&
      $('#reqVld').val() &&
      $('#spltr').val()
    ) {
      fetch('/WFM/SveNewBrkCde', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          a: $('#brkNme').val(),
          b: $('#DureePause').val(),
          c: $('#reqVld').val(),
          d: $('#spltr').val(),
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
          $('#brkNme').val('');
          $('#DureePause').val('');
          $('#reqVld').val('');
          $('#spltr').val('');
          getBrksCodeTble();
          getBrListAttr();
        })
        .catch((error) => {
          console.error('Error:', error.message);
        });
    } else {
      alert('please fill all the inputs ...');
    }
  });
  getBrListAttr();
  fetch('/getAllDprtmnts')
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        alert('error');
        throw new Error(`Error: ${response.statusText}`);
      }
    })
    .then((data) => {
      var dprts =
        "<option hidden value=''>sélectionner un département</option>";
      data.forEach((e) => {
        dprts += `<option value="${e.id}">${e.nme}</option>`;
      });
      $('#Departement').html(dprts);
    })
    .catch((error) => {
      console.error('Error:', error.message);
    });

  $('#Departement').on('change', () => {
    getAllAttrBrkForDprt();
  });

  $('#attrBrkBtn').click(() => {
    if ($('#Departement').val() && $('#lstBreaks option:selected').length > 0) {
      fetch('/WFM/attBrksCdes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          d: $('#Departement').val(),
          b: $('#lstBreaks').val(),
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            alert('error');
            throw new Error(`Error: ${response.statusText}`);
          }
        })
        .then((data) => {
          $('#lstBreaks').val([]);
          $('#lstBreaks').change();
          getAllAttrBrkForDprt();
        })
        .catch((error) => {
          console.error('Error:', error.message);
        });
    } else {
      alert('please fill all the inpusts ...');
    }
  });
});
