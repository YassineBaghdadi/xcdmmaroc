-- create database ERP;
use ERP;

create table if not exists _Entity(
    id int auto_increment primary key,
    nme text,
  	address text,
  	RC text,
  	ICE text,
  	theIF text,
  	TP text,
  	formJrdq text, 
  	capital text,
    addedAt datetime,
    createdBy text, 
    logo text;

);

create table if not exists _Clients (
	id int AUTO_INCREMENT PRIMARY KEY,
    nme text, 
    entt int ,
    FOREIGN key (entt) REFERENCES _Entity(id)
);

create table if not exists _Users (
	id int primary key auto_increment, 
	login int(1) default 1, 
	loginOutOfSaccom int(1) default 0, 
	fname varchar(100), 
	lname varchar(100), 
	bd date, 
	sex varchar(20), 
	nationality varchar(50), 
	CIN varchar(60), 
	famlyStts varchar(20), 
	childrenNmber int default 0, 
	city varchar(20), 
	zip varchar(20), 
    adress varchar(255), 
    phone varchar(30), 
    phone2 varchar(30), 
    email varchar(100), 
    bankName varchar(50), 
    bankAgence varchar(100) ,
    RIB varchar(50), 
    linkedin varchar(255) , 
    matricule varchar(100), 
    actualEntity int, 
    etablissment varchar(100), 
    jobeTitle varchar(50), 
    salaire float default 0.0,
    activeStatus int(1) default 0, 
    integrationDate date, 
    soldCnj float default 0,
    soldRecup float default 0,
    leaveDate date, 
    lastTransferDate date, 
    contractTpe varchar(20), 
    CNSS varchar(20), 
    ansuranceCmpny varchar(100), 
	ansuranceAffiliationNmber varchar(100), 
    usrNme varchar(100), 
    pwd text, 
    pic longblob, 
    lastAccess datetime,
    tkn text,
    picExt varchar(20),
    firstIntegrationDate date,
    clientDepartment text,
    cmnt text,
    foreign key(actualEntity) references _Entity(id)
    
);

create table if not exists _UserHstry(
    id int auto_increment primary key,
    usr int, 
    tpe varchar(100),
    details text,
    dtetme datetime,
    ip varchar(20),
    foreign key(usr) references _Users(id)
);

create table if not exists _Contracts(
    id int PRIMARY KEY AUTO_INCREMENT,
  stts text,
  etablissement text,
  entty int, 
  tpe text,
  dteIntgr date,
  dteOps datetime,
  endDte date,
  salaire int,
  usr int,
  byUsr int,
  pst text,
  closeReason text,
  FOREIGN KEY (usr) REFERENCES _Users (id),
  foreign key (byUsr) references _Users(id),
  FOREIGN KEY (entty) REFERENCES _Entity (id)
)


create table if not exists _CntrctTransferHstory(
    id int auto_increment primary key,
    trsfrDte date,
    opsDte date,
    usr int, 
    byUsr int, 
    oldEntty varchar(100),
    newEntty varchar(100),
    oldPst varchar(100),
    newPst varchar(100),
    isCntrctClosed int,
    closeCntrctDte date,
    newCntr varchar(100),
    oldCntrTpe varchar(100),
    foreign key (usr) references _Users(id),
    foreign key (byUsr) references _Users(id)
    
);

create table if not exists _WorkinDy(
	id int auto_increment primary key,
    usr int, 
    dte date,
    lgin datetime, 
    lgout datetime,
    ttlWrknTm varchar(20),
    prip varchar(20), 
    pbip varchar(20), 
    foreign key(usr) references _Users(id)
);

create table if not exists _BrksCodes(
    id int auto_increment primary key,
    nme varchar(50),
    maxDrtion int,
    requireValidation int,
    splitable int
)



create table if not exists _Breaks(
	id int auto_increment primary key,
    wrknDy int,
    strt datetime,
    fnsh datetime,
    drtion varchar(20),
    breakName varchar(50),
    prip varchar(20), 
    pbip varchar(20), 
    foreign key(wrknDy) references _WorkinDy(id)
);

create table if not exists _RemotlyWork(
	id int auto_increment primary key,
    usr int,
    strtDay date, 
    endDay date,
    foreign key (usr) references _Users(id)
);


create table if not exists _ActiveBreaks(
	id int auto_increment primary key,
    usr int, 
    brk int,
    started datetime,
    foreign key (usr) references _Users(id),
    foreign key (brk) references _Breaks(id)
);

create table if not exists _Departments (
	id int primary key auto_increment, nme varchar(200), dscrpt text, responsable int, Nplus2 int,
    foreign key (responsable) references _Users(id), foreign key (Nplus2) references _Users(id)
);

create table if not exists _BrksAttr(
    id int auto_increment primary key,
    dprt int ,
    brkCde int,
    foreign key (dprt) references _Departments(id),
    foreign key (brkCde) references _BrksCodes(id)
);

alter table _Users add column department int , add foreign key (department) references _Departments(id);


create table if not exists _Notifications (
	id int primary key auto_increment, 
    usr int,
    ttle varchar(200),
    msg text,
    dtetme datetime, 
    link text,
    rd int default 0,
    notified int default 0,
    foreign key (usr) references _Users(id)
);

create table if not exists _Conjes (
	id int primary key auto_increment, 
    usr int, dmntDte datetime, 
    fday date, 
    lday date, 
    duration int, 
    cnjType text, 
    responsableValidation int, 
    npls1Cmnt text,
    npls1TreatDte datetime,
    HRvalidation int, 
    hrCmnt text,
    hrTreatDte datetime,
    stts int, 
    prfFile longblob,
    fileExt varchar(10),
    foreign key (usr) references _Users(id)
);

create table if not exists _DCSrequests (
	id int primary key auto_increment, usr int, 
    dcs text, 
    msg text, 
    stts int, 
    dmntDte datetime, 
    treatmntDte datetime, 
    treatedBy int, 
    foreign key (usr) references _Users(id), 
    foreign key (treatedBy) references _Users(id)
);


create table if not exists _Decharges (
	id int primary key auto_increment, 
    usr int, reason varchar(100), 
    dmntDte datetime, 
    leaveDate datetime, 
    returnDate datetime, 
    msg text, 
    stts int, 
    responsableValidation int, 
    npls1Cmnt text,
    npls1TreatDte datetime,
    HRvalidation int,
    hrCmnt text,
    hrTreatDte datetime,
    foreign key (usr) references _Users(id)
);

create table if not exists _deplacements (
	id int primary key auto_increment, 
    usr int, 
    dmntDte datetime, 
    reason varchar(100), 
    transport varchar(50),
    leaveDate datetime, 
    returnDate datetime, 
    delegation text, 
    notes text, 
    stts int, 
    responsableValidation int, 
    npls1Cmnt text,
    npls1TreatDte datetime,
    HRvalidation int,
    hrCmnt text,
    hrTreatDte datetime,
    foreign key (usr) references _Users(id)
);

create table if not exists _recups (
	id int primary key auto_increment, 
    usr int, 
    dmntDte datetime, 
    leaveDate date, 
    returnDate date, 
    stts int, 
    msg text,
    responsableValidation int, 
    npls1Cmnt text,
    npls1TreatDte datetime,
    HRvalidation int,
    hrCmnt text,
    hrTreatDte datetime,
    foreign key (usr) references _Users(id)
);

create table if not exists _reclamation (
	id int primary key auto_increment, 
    usr int, 
    dmndDteTme datetime, 
    tpe varchar(50), 
    ttle varchar(50), 
    stts varchar(50),
    msg text, 
    
    foreign key (usr) references _Users(id)
);

create table if not exists _Posts (
	id int primary key auto_increment, usr int, ttle varchar(50), content text, postTime datetime, actve int(1), 
	foreign key (usr) references _Users(id)
);

create table if not exists _PostLikes (
	id int primary key auto_increment, usr int, post int, likeTime datetime, 
	foreign key (usr) references _Users(id), foreign key (post) references _Posts(id)
);

create table if not exists _PostComments (
	id int primary key auto_increment, usr int, post int, commentTime datetime, content text,
	foreign key (usr) references _Users(id), foreign key (post) references _Posts(id)
);

create table if not exists _Histories(
	id int auto_increment primary key , 
    usr int,
    alfa3il int,
    sbjct varchar(100),
    actionDteTme datetime,
    ttle varchar(100),
    details text,
    foreign key(usr) references _Users(id),
    foreign key(alfa3il) references _Users(id)
);

create table if not exists _Services (
	id int auto_increment primary key , 
	nme varchar(100),
    html longtext
);

CREATE TABLE if not exists _Managemnt (
    id INT auto_increment primary key , 
    usr INT,
    viewDshbrd INT DEFAULT 0,
    viewNews INT DEFAULT 0,
    vewUsers INT DEFAULT 0,
    vewFUsr INT DEFAULT 0,
    mdfFUser INT DEFAULT 0,
    view_C_usr INT DEFAULT 0,
    treat_C_usr INT DEFAULT 0,
    view_CNJ_usr INT DEFAULT 0,
    treat_CNJ_usr INT DEFAULT 0,
    mdf_soldCNJ INT DEFAULT 0,
    view_DCHRJ_usr INT DEFAULT 0,
    treat_DCHRJ_usr INT DEFAULT 0,
    view_DPLCM_usr INT DEFAULT 0,
    treat_DPLCM_usr INT DEFAULT 0,
    view_DCMT_usr INT DEFAULT 0,
    treat_DCMT_usr INT DEFAULT 0,
    view_HRDMNDS INT DEFAULT 0,
    
    vewRecrutDchbrd INT DEFAULT 0,
    recrutAddOffer INT DEFAULT 0,
    recrutViewOffers INT DEFAULT 0,
    recrutMdfOthersOffer INT DEFAULT 0,
    recrutViewCondidats INT DEFAULT 0,
    recrutViewFcondidat INT DEFAULT 0,
    recrutMdfFcondidat INT DEFAULT 0,
    WfmLogin INT DEFAULT 0,
    ViewWFMPlanning INT DEFAULT 0,
    wfmDcntOthers INT DEFAULT 0,
    wfmDispoOthers INT DEFAULT 0,
    wfmPauses INT DEFAULT 0,
    ViewFinanceDchbrd INT DEFAULT 0,
    financeAddEntt INT DEFAULT 0,
    it  INT DEFAULT 0,
    foreign key(usr) references _Users(id)
);

create table if not exists _Access (
	id int auto_increment primary key , 
	nme varchar(100),
	srvc int, 
	foreign key (srvc) references _Services(id)
);

create table if not exists _T_service(
	id int auto_increment primary key, 
    dprt int,
    srvc int, 
    foreign key (dprt) references _deplacements(id),
    foreign key (srvc) references _Services(id)
);

create table if not exists _T_access(
	id int auto_increment primary key, 
    usr int,
    access int, 
    foreign key (usr) references _Users(id),
    foreign key (access) references _Access(id)
);


create table if not exists _Tasks (
	id int auto_increment primary key,
    nme text,
    usr int, 
    createdBy int, 
    creationTime datetime, 
    treated int default 0,
    treatedDate datetime,
    tpe varchar(20), 
    cnj int,
    dchrge int, 
    dplcmnt int, 
    recup int, 
    foreign key (usr) references _Users(id),
    foreign key (createdBy) references _Users(id),
    foreign key (cnj) references _Conjes(id),
    foreign key (dchrge) references _Decharges(id),
    foreign key (dplcmnt) references _deplacements(id),
    foreign key (recup) references _recups(id)
);

create table if not exists _taskCntrbt (
    id int auto_increment primary key,
    byUsr int,
    usr int, 
    tsk int,
    opDte datetime,
    foreign key (byUsr) references _Users(id),
    foreign key (usr) references _Users(id),
    foreign key (tsk) references _Tasks(id)
)

create table if not exists _TaskStep(
	id int auto_increment primary key,
    task int, 
    usr int,
    nme text, 
    d1 date, 
    d2 date,
    createdBy int,
    foreign key (task) references _Tasks(id),
    foreign key (usr) references _Users(id),
    foreign key (createdBy) references _Users(id)
    
);

create table if not exists _TasksHistory(
	id int auto_increment primary key,
    task int, 
    usr int,
    details text,
    dte datetime, 
    ip varchar(20),
    foreign key (task) references _Tasks(id),
    foreign key (usr) references _Users(id)
    
);


create table if not exists _JobOffers(
	id int auto_increment primary key, 
    uniqId text,
    dte datetime,
    createdBy int,
    nme text,
    rcrtTpe text,
    rcrtPar text,
    rcrtPour text,
    cntrTpe text,
    wrkTpe text,
    startDte date,
    endDte date,
    stts text,
    fonctions text,
    sector text,
    place text,
    city text,
    salair text,
    formation text,
    expYrs text,
    etudLevel text,
    cmpny text,
    post text,
    missions text,
    prfile text,
    descrpt text,
    lastUpdate datetime,
    lastUpdateBy text,
    FOREIGN KEY (createdBy) REFERENCES _Users(id)
  
);

create table if not exists _carreerCondidats(
    id int auto_increment primary key, 
    uniqID text,
    pswrd text,
    civilite text,
    fname text,
    lname text,
    prflTtle text,
    bd date,
    nationality text,
    familystatus text,
    email text,
    phone text,
    linkedIn text,
    address text,
    zip text,
    city text,
    disponibility text,
    actualFonction text,
    actualPost text,
    actualSector text, 
    desiredSector text ,
    actualRegion text,
    actualSalaire text,
    desiredFonction text,
    expYrs text,
    desiredRegion text,
    desiredSalaire text,
    formation text,
    etudLevel text,
    cv LONGBLOB,
    cvEXT text,
    tkn text,
    pic longblob,
    picEXT text,
    addedDte datetime,
    lastUpdate datetime
  
);

create table if not exists _carreerCondidatsLangs(
	id int auto_increment primary key,
  nme text, 
  lvl text, 
  cndidat int, 
  addedBy text,
  addedDte datetime,
  evaluation text,
  evaluatedBy text,
  evaluationDte datetime,
  FOREIGN KEY (cndidat) REFERENCES _carreerCondidats(id)
  
 );
 
 create table if not exists _carreerCondidatsSkills(
	id int auto_increment primary key,
    nme text, 
    cndidat int, 
    FOREIGN KEY (cndidat) REFERENCES _carreerCondidats(id)
  
 );
 
 create table if not exists _carreerCondidatsAplies(
    id int auto_increment primary key,
    dte datetime, 
    cndidat int, 
    ofr int,
    qlf text,
    qlfBy int, 
    qlfDte datetime,
    interviewDte datetime,
    qlfCmnt text,
    appliedBy text,
    FOREIGN KEY (cndidat) REFERENCES _carreerCondidats(id),
    FOREIGN KEY (ofr) REFERENCES _JobOffers(id),
    FOREIGN KEY (qlfBy) REFERENCES _Users(id)
  
 );

  create table if not exists _carreerApplieQlfHstry(
    id int auto_increment primary key,
    dte datetime, 
    aply int, 
    qlf text,
    qlfBy text, 
    interviewDte datetime,
    cmnt text,
    FOREIGN KEY (aply) REFERENCES _carreerCondidatsAplies(id)
  
 );

 

 create table if not exists _cndNewsLetters(
  id int auto_increment primary key,
  email text,
  addDte datetime
  
)








