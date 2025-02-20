if (window.location.pathname.includes('.html')) {
  window.location.href = '/';
}

const tst = Swal.mixin({
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

$(document).ready(async function () {
  const socket = io();
  socket.on('NewNotf', (msg) => {
    console.log(msg);

    tst.fire({
      icon: 'info',
      title: 'Vous avez une nouvelle notification',
      text: msg,
    });
  });

  socket.on('byeZine', async (e) => {
    console.log(e);

    window.location.replace('/logout');
    // await fetch('/logout');
  });

  socket.on('allNtfs', (ntfs) => {
    $('#nofsArea').html(ntfs);
  });
  socket.on('currecntTime', (ntfs) => {
    $('#nofsArea').html(ntfs);
  });

  var chechIP = async () => {
    await fetch('/checkIp');
  };
  await chechIP();

  fetch('nav.html')
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(function (content) {
      $('#theNavBar').html(content);
    })
    .catch(function (error) {
      console.error('There was a problem with the fetch operation:', error);
    });

  fetch('leftSide.html')
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(function (content) {
      $('#sidebar').html(content);
    })
    .catch(function (error) {
      console.error('There was a problem with the fetch operation:', error);
    });

  // async function Check() {
  //   try {
  //     const response = await fetch("https://ipinfo.io/ip");
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }

  //     const publicIP = await response.text();
  //     //   console.log(publicIP);

  //     fetch("/checkRemote", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ i: publicIP }),
  //     })
  //       .then((response) => {
  //         if (response.ok) {
  //           return response.json();
  //         } else {
  //           throw new Error(`Error: ${response.statusText}`);
  //         }
  //       })
  //       .then((data) => {
  //         fetch("rightSide.html")
  //           .then(function (response) {
  //             if (!response.ok) {
  //               throw new Error("Network response was not ok");
  //             }
  //             return response.text();
  //           })
  //           .then(function (content) {
  //             // $("#right-sidebar").html(content);

  //             fetch("/WFM/lgn")
  //               .then((response) => response.json())
  //               .then((data) => {
  //                 if (data.error) {
  //                   console.error(data.error);
  //                 } else {
  //                   // console.log(data);
  //                   if (data.message == "off") {
  //                     fetch("err2.html")
  //                       .then(function (response) {
  //                         if (!response.ok) {
  //                           throw new Error("Network response was not ok");
  //                         }
  //                         return response.text();
  //                       })
  //                       .then(function (content) {
  //                         $("#right-sidebar").html(content);
  //                       })
  //                       .catch(function (error) {
  //                         console.error(
  //                           "There was a problem with the fetch operation:",
  //                           error
  //                         );
  //                       });
  //                   } else {
  //                     $("#right-sidebar").html(content);
  //                     document.getElementById("timelog").innerHTML =
  //                       data.message;
  //                   }
  //                 }
  //               })
  //               .catch((error) => {
  //                 console.error("Error:", error);
  //               });
  //           })
  //           .catch(function (error) {
  //             console.error(
  //               "There was a problem with the fetch operation:",
  //               error
  //             );
  //           });
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //         fetch("err.html")
  //           .then(function (response) {
  //             if (!response.ok) {
  //               throw new Error("Network response was not ok");
  //             }
  //             return response.text();
  //           })
  //           .then(function (content) {
  //             $("#right-sidebar").html(content);
  //           })
  //           .catch(function (error) {
  //             console.error(
  //               "There was a problem with the fetch operation:",
  //               error
  //             );
  //           });
  //       });
  //   } catch (error) {
  //     console.error("Error fetching public IP:", error.message);
  //   }
  // }

  async function Check() {
    try {
      fetch('/checkRemote')
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Error: ${response.statusText}`);
          }
        })
        .then((data) => {
          fetch('rightSide.html')
            .then(function (response) {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.text();
            })
            .then(function (content) {
              // $("#right-sidebar").html(content);

              fetch('/WFM/lgn')
                .then((response) => response.json())
                .then((data) => {
                  if (data.error) {
                    console.error(data.error);
                  } else {
                    // console.log(data);
                    if (data.message == 'off') {
                      fetch('err2.html')
                        .then(function (response) {
                          if (!response.ok) {
                            throw new Error('Network response was not ok');
                          }
                          return response.text();
                        })
                        .then(function (content) {
                          $('#right-sidebar').html(content);
                        })
                        .catch(function (error) {
                          console.error(
                            'There was a problem with the fetch operation:',
                            error
                          );
                        });
                    } else {
                      $('#right-sidebar').html(content);
                      document.getElementById('timelog').innerHTML =
                        data.message;
                    }
                  }
                })
                .catch((error) => {
                  console.error('Error:', error);
                });
            })
            .catch(function (error) {
              console.error(
                'There was a problem with the fetch operation:',
                error
              );
            });
        })
        .catch((error) => {
          console.log(error);
          fetch('err.html')
            .then(function (response) {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.text();
            })
            .then(function (content) {
              $('#right-sidebar').html(content);
            })
            .catch(function (error) {
              console.error(
                'There was a problem with the fetch operation:',
                error
              );
            });
        });
    } catch (error) {
      console.error('Error fetching public IP:', error.message);
    }
  }

  Check();
});
