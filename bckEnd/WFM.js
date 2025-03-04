const express = require('express');
const app = express.Router();
require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.json());
app.use(cookieParser());
const path = require('path');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');

const { db } = require('./DB_cnx');
const { lg } = require('./lg');
const { log } = require('console');

app.use((req, res, next) => {
  jwt.verify(
    req.cookies.jwtToken,
    String(process.env.sessionSecret),
    (err, decoded) => {
      if (err) {
        res.redirect('/ERP/login');
      } else {
        next();
      }
    }
  );
});

function getCurrentTime() {
  return moment.tz('Africa/Casablanca').format('YYYY-MM-DD HH:mm:ss');
}

function pad(num) {
  return num < 10 ? '0' + num : num;
}

var getDuration = (d1, d2) => {
  const duration = moment
    .tz(d2, 'Africa/Casablanca')
    .diff(moment.tz(d1, 'Africa/Casablanca'));

  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((duration % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

var getBrkDrt = (d, d2 = null) => {
  // const currentDate = new Date(
  //   moment.tz("Africa/Casablanca").format("YYYY-MM-DD HH:mm:ss")
  // );
  // let h = currentDate.getHours() + 1;
  // const formattedTime = `${currentDate.getFullYear()}-${
  //   currentDate.getMonth() + 1
  // }-${currentDate.getDate()} ${h.toString().padStart(2, "0")}:${currentDate
  //   .getMinutes()
  //   .toString()
  //   .padStart(2, "0")}:${currentDate.getSeconds().toString().padStart(2, "0")}`;
  // const date1 = new Date(`${formattedTime}`);
  // const date2 = new Date(`${d}`);
  // const timeDifference = date1 - date2;
  // const diffDate = new Date(timeDifference);
  // const diffHours = diffDate.getUTCHours().toString().padStart(2, "0");
  // const diffMinutes = diffDate.getUTCMinutes().toString().padStart(2, "0");
  // const diffSeconds = diffDate.getUTCSeconds().toString().padStart(2, "0");
  // // console.log(`${diffHours}:${diffMinutes}:${diffSeconds}`);
  // return `${diffHours}:${diffMinutes}:${diffSeconds}`;

  // const duration = moment.duration(moment().diff(moment(d)));
  try {
    const endDate = new Date();
    var startDate = new Date(d);
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

    return `${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error:', error);
  }
};

var formatDate = (d) => {
  if (d) {
    return d.getHours() != 0
      ? moment(d).format('DD/MM/YYYY HH:mm:ss')
      : moment(d).format('DD/MM/YYYY');
  } else {
    return 'N/A';
  }
};

// const today = date_ob.getFullYear() + "-" + mnth + "-" + dy;
app.use(express.static(path.join(__dirname, '../frntEnd'), { index: false }));

app.get('/Administration', (req, res) => {
  res.sendFile(path.join(__dirname, '../frntEnd', 'WFM-Administration.html'));
});

app.get('/', (req, res) => {
  res.redirect(301, '/ERP/WFM/Administration');
});

app.get('/Pauses', async (req, res) => {
  var [checkPermsion] = await db.execute(
    `select wfmPauses as p from _Managemnt where usr = ${req.cookies.usdt.id}`
  );
  if (checkPermsion[0].p == 1) {
    res.sendFile(path.join(__dirname, '../frntEnd', 'WFM-PAUSE.html'));
  } else {
    res.sendFile(path.join(__dirname, '../frntEnd', 'accessDenied.html'));
  }
});

app.get('/Plannings', async (req, res) => {
  var [checkPermsion] = await db.execute(
    `select ViewWFMPlanning as p from _Managemnt where usr = ${req.cookies.usdt.id}`
  );
  if (checkPermsion[0].p == 1) {
    res.sendFile(
      path.join(__dirname, '../frntEnd', 'WFM-AdherencePlanning.html')
    );
  } else {
    res.sendFile(path.join(__dirname, '../frntEnd', 'accessDenied.html'));
  }
});

app.get('/checkActiveBrk', async (req, res) => {
  // todo : check by workDays not today
  const [r] =
    await db.execute(`select b.breakName as bnm, b.strt as sstt from _ActiveBreaks a 
                                inner join _Breaks b on a.brk = b.id 
                                inner join _WorkinDy w on b.wrknDy = w.id 
                                where a.usr = ${req.cookies.usdt.id};`);
  // console.log(r);
  if (!r[0]) {
    res.json({ message: '0' });
  } else {
    res.json({
      message: 'YassineBaghdadi',
      brk: `${r[0].bnm}`,
      strt: `${r[0].sstt}`,
    });
  }

  // todo:
});

app.post('/saveBr', async (req, res) => {
  try {
    const { brk } = req.body;

    const [bbb] = await db.execute(`select * from _ActiveBreaks a 
                                  inner join _Breaks b on a.brk = b.id 
                                  inner join _WorkinDy w on b.wrknDy = w.id 
                                  where a.usr = ${req.cookies.usdt.id} and w.lgout is null`);
    if (bbb[0]) {
      res.status(401).json({ message: 'the operation failed' });
    } else {
      const [wd] = await db.execute(
        `select id from _WorkinDy where usr = ${req.cookies.usdt.id} and lgout is null`
      );
      const tm = getCurrentTime();
      const [b] = await db.execute(
        `insert into _Breaks(wrknDy, strt, breakName) value(${wd[0].id}, "${tm}", "${brk}")`
      );

      const [ab] = await db.execute(
        `insert into _ActiveBreaks(usr, brk, started) value(${req.cookies.usdt.id}, ${b.insertId}, "${tm}")`
      );
      res.status(200).json({ message: 'done', s: tm });
    }
  } catch (error) {
    lg.error(error);
  }
});

app.get('/getAllBrks', async (req, res) => {
  try {
    const [r] = await db.execute(
      `select b.breakName, b.drtion,b.strt , b.fnsh , (select maxDrtion from _BrksCodes where nme like b.breakName ) as mxDr
    from _Breaks b inner join _WorkinDy w on b.wrknDy = w.id where w.usr = ${req.cookies.usdt.id} and w.lgout is null ;`
    );

    // console.log(r);

    res.json(r);
    // todo:
  } catch (error) {
    lg.error(error);
  }
});

app.get('/dispo', async (req, res) => {
  try {
    const [bb] = await db.execute(
      `select id, brk, started from _ActiveBreaks where usr = ${req.cookies.usdt.id}`
    );
    if (bb[0]) {
      const durt = getBrkDrt(bb[0].started);

      await db.execute(
        `update _Breaks set fnsh = "${getCurrentTime()}", drtion = "${durt}" where id = ${
          bb[0].brk
        }`
      );
      await db.execute(`delete from _ActiveBreaks  where id = ${bb[0].id}`);
      res.json({ message: 'done', d: durt });
    } else {
      res.status(401).json({ message: 'operation failed' });
    }
  } catch (error) {
    lg.error(error);
  }
});

app.post('/makeAgDispo', async (req, res) => {
  try {
    const i = req.body.i;

    const [bb] = await db.execute(
      `select id, brk, started from _ActiveBreaks where usr = ${i}`
    );
    if (bb[0]) {
      const durt = getBrkDrt(bb[0].started);

      await db.execute(
        `update _Breaks set fnsh = "${getCurrentTime()}", drtion = "${durt}" where id = ${
          bb[0].brk
        }`
      );
      await db.execute(`delete from _ActiveBreaks  where id = ${bb[0].id}`);
      res.json({ message: 'done', d: durt });
    } else {
      res.status(401).json({ message: 'operation failed' });
    }
  } catch (error) {
    lg.error(error);
  }
});

app.post('/dcnctAg', async (req, res) => {
  try {
    const i = req.body.i;
    const [rr] = await db.execute(
      `select id, lgin from _WorkinDy where usr = ${i} and lgout is null`
    );

    if (rr[0]) {
      const [actvBr] = await db.execute(
        `select brk, started from _ActiveBreaks where usr = ${i}`
      );
      if (actvBr[0]) {
        await db.execute(
          `update _Breaks set fnsh = "${getCurrentTime()}", drtion = "${getBrkDrt(
            actvBr[0].started
          )}" where id = ${actvBr[0].brk}`
        );
        await db.execute(`delete from _ActiveBreaks  where usr = ${i}`);
      }

      const [r] = await db.execute(
        `update _WorkinDy set lgout = "${getCurrentTime()}", ttlWrknTm = "${getBrkDrt(
          rr[0].lgin
        )}" where id = ${rr[0].id}`
      );
    }
    await db.execute(`update _Users set tkn = null where id = ${i}`);

    res.send({ message: 'done' });
  } catch (error) {
    lg.error(error);
  }
});

app.get('/lgn', async (req, res) => {
  try {
    const [rr] = await db.execute(
      `select * from _WorkinDy where usr = ${
        req.cookies.usdt.id
      } and (lgin like "${getCurrentTime().split(' ')[0]}%" or lgout is null)`
    );

    if (!rr[0]) {
      const [r] = await db.execute(
        `insert into _WorkinDy (usr, lgin) value(${
          req.cookies.usdt.id
        }, "${getCurrentTime()}")`
      );

      // res.json({message:`${dy}-${mnth}-${date_ob.getFullYear()} ${formattedTime}`});
      res.json({ message: `${getCurrentTime()}` });
    } else {
      // res.json({message:`${rr[0].lgin}`});

      // res.json({message:`${dob.getFullYear()}-${(dob.getMonth()+1)}-${dob.getDate()} ${h.toString().padStart(2, '0')}:${dob.getMinutes().toString().padStart(2, '0')}:${dob.getSeconds().toString().padStart(2, '0')}`});
      if (rr[0].lgout) {
        res.json({ message: `off` });
      } else {
        res.json({
          // message: `${moment
          //   .tz(rr[0].lgin, "Africa/Casablanca")
          //   .format("YYYY-MM-DD HH:mm:ss")}`,
          message: formatDate(rr[0].lgin),
        });
      }
    }
  } catch (error) {
    lg.error(error);
  }
});

app.get('/getWfmBreaksCodes', async (req, res) => {
  try {
    const [r] = await db.execute(
      `select bb.nme from _BrksAttr b 
	      inner join _BrksCodes bb on b.brkCde = bb.id 
        inner join _Departments dd on b.dprt = dd.id 
        inner join _Users u on u.department = dd.id 
        where u.id = ${req.cookies.usdt.id} and (bb.splitable = 1 or  bb.nme not in (select b1.breakName from _Breaks b1 
                                          inner join _WorkinDy wd on b1.wrknDy = wd.id 
                                          where wd.usr = ${req.cookies.usdt.id} and wd.lgout is null));
`
    );
    var o = '<option  hidden >prendre une pause</option>';
    r.forEach((e) => {
      o += `<option value="${e.nme}">${e.nme}</option>`;
    });

    res.json({ o: o });
    // todo:
  } catch (error) {
    lg.error(error);
  }
  // res.json(`select bb.nme from _BrksAttr b inner join _BrksCodes bb on b.brkCde = bb.id inner join _Departments dd on b.dprt = dd.id inner join _Users u on u.department = dd.id where u.id = ${req.cookies.usdt.id} and (bb.splitable = 1 or bb.nme not in (select b1.breakName from _Breaks b1 inner join _WorkinDy wd on b1.wrknDy = wd.id where wd.usr = ${req.cookies.usdt.id} and wd.lgout is null));
  // `)
});

// app.get("/tt", async (req, res) => {
//   const [t] = await db.execute(
//     `select lgin from _WorkinDy where usr = ${req.cookies.usdt.id}`
//   );

//   res.send(getBrkDrt(formatDate(t[0].lgin)));
// });

app.post('/getWorkDaysTbl', async (req, res) => {
  try {
    // var dayF =  `and wd.lgin like "${today}%"  and wd.lgout is null`;
    var dayF = ` and wd.lgout is null`;
    var dprtF = '';
    var sttsF = '';
    var keyF = '';
    if (req.body.d) {
      dayF = `and wd.lgin like "${req.body.d}%"`;
    }
    if (req.body.dd) {
      dprtF = `and d.id = ${req.body.dd}`;
    }
    if (req.body.s) {
      sttsF = `and b.breakName like "${req.body.s}"`;
    }
    if (req.body.k) {
      keyF = `and (u.fname like "%${req.body.k}%" or u.lname like "%${req.body.k}%" or u.CIN like "%${req.body.k}%" or u.CNSS like "%${req.body.k}%"
    or u.phone like "%${req.body.k}%" or u.phone2 like "%${req.body.k}%" or u.email like "%${req.body.k}%" )`;
    }

    const qr = `
  select u.id, u.pic, concat(u.fname, " ", u.lname) as usrNme, 
    d.nme as dprtmnt, wd.lgin, wd.lgout, wd.ttlWrknTm, b.breakName, b.strt, wd.id as wrkdy, u.picExt
  from _Users u 
    left join _Departments d on u.department = d.id 
    inner join _WorkinDy wd on wd.usr = u.id 
    left join _ActiveBreaks ac on ac.usr = u.id 
    left join _Breaks b on ac.brk = b.id 
  where u.id > 1 ${dayF} ${dprtF} ${sttsF} ${keyF};`;

    const [tbl] = await db.execute(qr);

    // console.log(qr);

    tbl.forEach(async (ee) => {
      // console.log(formatDate(ee.lgin));
      // console.log(getBrkDrt(ee.lgin));
      // try {

      ee.pic = `./rcs/ProfilePics/${ee.id}.${ee.picExt}`;

      ee.showDcnct = ee.id == req.cookies.usdt.id ? 'hidden' : '';
      if (!ee.breakName) {
        // find a way to get the when the user became dispo ....
        // const [lastBfnsh] = await db.execute(
        //   `SELECT * FROM erp._breaks where wrknDy = ${ee.wrkdy} order by id desc  limit 1;`
        // );
        // ee.strt = getBrkDrt(lastBfnsh[0].fnsh);
        ee.breakName = 'Dispo';

        // const [brksTt] = await db.execute(
        //   `select SEC_TO_TIME(SUM(TIME_TO_SEC(drtion))) as brksTt from _Breaks where wrknDy = ${ee.wrkdy}`
        // );
        // const differenceMs = moment(getBrkDrt(ee.lgin), "HH:mm:ss").diff(
        //   moment(brksTt[0].brksTt, "HH:mm:ss")
        // );
        // if (ee.lgout) {
        //   differenceMs = moment(getDuration(ee.lgin, ee.lgout), "HH:mm:ss").diff(
        //     moment(brksTt[0].brksTt, "HH:mm:ss")
        //   );
        // }
        // const duration = moment.duration(differenceMs);
        // const hours = Math.floor(duration.asHours());
        // const minutes = duration.minutes();
        // const seconds = duration.seconds();

        // ee.strt = `${hours.toString().padStart(2, "0")}:${minutes
        //   .toString()
        //   .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      } else {
        ee.strt = getBrkDrt(ee.strt);
      }
      if (ee.lgout) {
        ee.lgout = formatDate(ee.lgout);
        ee.breakName = 'LogedOff';
      }

      if (!ee.ttlWrknTm) {
        ee.ttlWrknTm = getBrkDrt(ee.lgin);
      }
      ee.lgin = formatDate(ee.lgin);
    });
    // console.log(tbl);
    res.json(tbl);
    // res.json({ d: dayF, dd: dprtF, s: sttsF, k: keyF });
  } catch (error) {
    lg.error(error);
  }
});

app.post('/getTodayBRsForAgent', async (req, res) => {
  try {
    const ii = req.body.ii;
    let dy = `and w.lgin like "${getCurrentTime().split(' ')[0]}%"`;
    if (req.body.d) {
      dy = `and w.id = ${req.body.d}`;
    }

    const [allBrs] = await db.execute(
      `select b.breakName, b.strt, b.fnsh, b.drtion 
    from _Breaks b inner join _WorkinDy w on b.wrknDy = w.id where w.usr = ${ii} ${dy}`
    );
    res.json({
      a: `${req.cookies.usdt.fname} ${req.cookies.usdt.lname}`,
      t: allBrs,
    });
  } catch (error) {
    lg.error(error);
  }
});

app.post('/getBrksCodeTble', async (req, res) => {
  try {
    var c = 'select * from _BrksCodes ';
    if (req.body.d) {
      c += ` where id not in (select brkCde from _BrksAttr where dprt = ${req.body.d})`;
    }
    const [dt] = await db.execute(c);
    if (dt) {
      res.send(dt);
    } else {
      res.status(503).send('error');
    }
  } catch (error) {
    lg.error(error);
  }
});

app.post('/SveNewBrkCde', async (req, res) => {
  try {
    await db.execute(
      `insert into _BrksCodes(nme, maxDrtion, requireValidation, splitable) value ("${req.body.a}", ${req.body.b}, ${req.body.c}, ${req.body.d})`
    );
    res.json({ message: 'done' });
  } catch (error) {
    lg.error(error);
    res.status(403).json({ message: 'error' });
  }
});

app.post('/rmBrCde', async (req, res) => {
  try {
    await db.execute(`delete from _BrksAttr where brkCde = ${req.body.i}`);
    await db.execute(`delete from _BrksCodes where id = ${req.body.i}`);
    res.json({ message: 'Done' });
  } catch (error) {
    lg.error(error);
  }
});

app.post('/getAttBrksCdes', async (req, res) => {
  try {
    const [bb] =
      await db.execute(`select bc.nme as bnme, bc.maxDrtion as drt from _BrksCodes bc 
                                  inner join _BrksAttr ba on ba.brkCde = bc.id 
                                  inner join _Departments d on ba.dprt = d.id where d.id = ${req.body.i} `);

    res.json(bb);
  } catch (error) {
    lg.error(error);
  }
});

app.post('/attBrksCdes', async (req, res) => {
  try {
    var qr = `insert into _BrksAttr(dprt, brkCde) values `;
    const { d, b } = req.body;
    var t = 0;
    b.forEach((e) => {
      if (!t) {
        t = 1;
      } else {
        qr += ', ';
      }
      qr += `(${d}, ${e})`;
    });
    // console.log(qr);
    await db.execute(qr);

    res.send({ message: 'done' });
  } catch (error) {
    lg.error(error);
  }
});

app.use(function (req, res) {
  // res.redirect(301, '/');
  res.json({
    error: {
      name: 'Error',
      status: 404,
      message: 'Invalid Request',
      statusCode: 404,
    },
    message: 'wrong url',
  });
});

module.exports = app;
