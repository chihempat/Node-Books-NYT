var express = require('express');
var app = express.Router();
const httphelper = require('../helper/get');
const xl = require('excel4node');
const { parse } = require('json2csv');

// GET / - for UI purposes get names of all genres
app.get('/', async (req, res, next) => {
  const key = process.env.API_KEY;
  const typesUrl = "http://api.nytimes.com/svc/books/v3/lists/names.json?";
  const url = typesUrl + '&api-key=' + key;

  httphelper(url).then(body => {
    let data1 = [{}];
    let bookData = JSON.parse(body);
    bookData.results.map(data => {
      data1.push({ title: data.list_name , encoded: data.list_name_encoded });
    })
    res.render('index', { title: 'SCROLL', bookList: data1 });
  })
    .catch((err) => {
      console.log(err);
    })
});



// GET /all - genrate EXCELL FOR all NYT BestSellers.
app.get('/all', async (req, res, next) => {
  const key = process.env.API_KEY;
  const all = "http://api.nytimes.com/svc/books/v3/lists/overview.json?";
  const url = all + 'api-key=' + key;
  console.log(url);

  httphelper(url).then(body => {
    let data1 = [{}];
    let bookData = JSON.parse(body);
    bookData.results?.lists.forEach(data => {
      data.books.forEach(book => {
        data1.push(book);
      })
    })

    var wb = new xl.Workbook();

    var ws = wb.addWorksheet('Sheet 1');

    var style = wb.createStyle({
      font: {
        color: '#000000',
        size: 12,
      },
      numberFormat: '$#,##0.00; ($#,##0.00); -',
    });

    data1.forEach((data, index1) => {
      Object.keys(data).forEach((key, index2) => {
        let value = (data[key] === null || data[key] === undefined) ? '' : data[key];
        ws.cell(index1+2, index2+2)
          .string((value).toString())
          .style(style);
      })
    })
    wb.write('book.xlsx', res);

  })
    .catch((err) => {
      console.log(err);
    })
});

// GET /book - genrate csv from book name.
/**
 * @param {body} req.query
 * @param {string} res.query.genreName
 */

app.get('/genres', async (req, res)=> {
  const key = process.env.API_KEY;
  const genres = req.query.genreName;
  const typesUrl = "http://api.nytimes.com/svc/books/v3/lists.json?";
  const url = typesUrl +"list="+genres+ '&api-key=' + key;
  httphelper(url).then(body => {
    let data1 = [];
    let bookData = JSON.parse(body);
    bookData.results.map(data => {
      data1.push(data.book_details);
    });
    res.render('genres', { title: 'SCROLL', bookList: data1, genreName: genres.split('-').join(' ').toUpperCase() });
    //res.send(data1);
  })
    .catch((err) => {
      console.log(err);
    })
})


// GET /book - genrate csv from book name.
/**
 * @param {body} req.query
 * @param {string} res.query.bookName
 */
app.get('/book', async (req, res)=> {
  const key = process.env.API_KEY;
  const name = req.query.bookName;
  const typesUrl = "http://api.nytimes.com/svc/books/v3/lists/best-sellers/history.json?";
  const url = typesUrl +"title="+name+'&api-key=' + key;
  httphelper(url).then(body => {
    let data1 = [];
    let bookData = JSON.parse(body);
    bookData.results.map(data => {
      data1.push(data);
    })
    const csv = parse(data1);
    res.setHeader('Content-disposition', 'attachment; filename=book.csv');
    res.set('Content-Type', 'text/csv');
    res.status(200).send(csv);

    //res.send(data1);
  })
    .catch((err) => {
      console.log(err);
    })
})

module.exports = app;
