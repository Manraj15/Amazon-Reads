var footer = document.createElement('div');
var button = document.createElement('button');
var footerText = document.createElement('p');
var arrow = document.createElement('i');
var div = document.createElement('div');
var right = document.createElement('div');
var closeBtn = document.createElement('a');
var lis = document.querySelectorAll('li > b');
var select = document.createElement('select');
var book;

//add footer to bottom of Amazon page if user is viewing a book on amazon
for(var i = 0; i < lis.length; i++){
	
	//looks for books ISBN
	//If found, footer will be added
	if(lis[i].parentNode.innerText.indexOf('ISBN-10')>=0){  
		footerText.textContent = 'Click to View Goodreads Reviews and Library Info';

		arrow.setAttribute('class', 'up');
		footer.setAttribute('class', 'bottomNav');
		div.setAttribute('class', 'bottomPage');
		closeBtn.href = 'javascript:void(0)';
		closeBtn.setAttribute('class', 'closebtn');
		right.setAttribute('class', 'right');
		closeBtn.innerHTML = '&times;';

		footer.appendChild(arrow);
		footer.appendChild(footerText);
		div.appendChild(closeBtn);

		footer.onclick = open;
		closeBtn.onclick = close;

		var begIndex = lis[i].parentNode.innerText.indexOf(' ');
		getReviews(lis[i].parentNode.innerText.slice(begIndex+1, lis[i].parentNode.innerText.length));

		document.getElementsByTagName('html')[0].appendChild(footer);
		document.getElementsByTagName('html')[0].appendChild(div);
	}
	
}

//Grabs GoodReads reviews using the GoodReads API
function getReviews(isbn){
	var key = 'Cglgf8yZv4ZsdTeqlCJK7g';
	var sec = 'lZOWGB1Rih9qW9pLssxvyAifJVppow0hWiC2y6AKiU';

	var url = 'https://www.goodreads.com/book/isbn/' + isbn + '?key=' + key;
	const proxyurl = "https://cors-anywhere.herokuapp.com/";
	fetch(proxyurl + url).then(function(result){
		return result.text();
	}).then(function(text){
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(text, 'text/xml');
		var reviewsText = xmlDoc.getElementsByTagName('reviews_widget')[0].childNodes[1].data;
		var reviews = parser.parseFromString(reviewsText, 'text/html').getElementsByTagName('div')[0];
		book = xmlDoc.getElementsByTagName('title')[0].textContent;
		div.appendChild(reviews);

		var x = 5;

		//add options bar to pick mississauga or toronto public library
		var op1 = document.createElement('option');
		var op2 = document.createElement('option');
		op1.text = 'Toronto Public Library System';
		op1.value = 'Toronto Public Library System'
		op1.selected = true;
		op2.text = 'Mississauga Public Library System';
		op2.value = 'Mississauga Public Library System';
		select.add(op1);
		select.add(op2);
		select.addEventListener('change', appendLibraryInfo);
		appendLibraryInfo(book);
		right.appendChild(select);
		div.appendChild(right);
	});
}

//checks whihc library system the user has selected, and grabs books from appropriate site
function appendLibraryInfo(){
	if(select.value === 'Toronto Public Library System'){
		appendTOBooks(book);

	}

	else if(select.value === 'Mississauga Public Library System'){
		appendMISBooks();
	}
}

//grabs all related titles from the Mississauga library system
function appendMISBooks(){
	clear();

	const proxyurl = "https://cors-anywhere.herokuapp.com/";
	var bookUrl = book.replace(/ /g, "+");
	var url = 'https://miss.ent.sirsidynix.net/client/en_US/mlsathome/search/results?qu=' + bookUrl + '&te=ILS&av=0';

	fetch(proxyurl + url).then(function(result){
		return result.text();
	}).then(function(text){
		var parser = new DOMParser();
		var html = parser.parseFromString(text, 'text/html');
		var i = 0;
		while(html.getElementById('results_cell' + String(i))) {

			//Grab all book info, such as author, title, date published, and add it all to an array
			var arr = [];
			arr.push(html.getElementById('results_bio' + String(i)).firstChild.childNodes[1].firstChild.title);
			var createrType = html.getElementById('results_bio' + String(i)).childNodes[1].firstChild.textContent;
			var name = html.getElementById('results_bio' + String(i)).childNodes[1].childNodes[1].childNodes[1].firstChild.textContent;
			arr.push(createrType + ': ' + name);
			arr.push(html.getElementsByClassName('displayElementText highlightMe PUBDATE')[i].textContent);
			arr.push('format' + ': ' + html.getElementById('formatContainer0').firstChild.title);
			arr.push(html.getElementById('syndeticsImg' + String(i)).src);
			
			var libDiv = document.createElement('div');
			var newDiv = document.createElement('div');

			newDiv.setAttribute('class', 'libraryDiv');
			libDiv.setAttribute('class', 'listDiv');

			appendLists(libDiv, arr, 'mis');

			var img = document.createElement('img');
			img.src = arr[arr.length-1];
			newDiv.appendChild(libDiv);
			newDiv.appendChild(img);
			console.log('hi');

			right.appendChild(newDiv);
			i+=1;
		}

		if(i === 0){
			var p = document.createElement('p');
			p.textContent = 'Sorry, No related titles were found';
			right.appendChild(p);
		}
		div.appendChild(right);
	});
}

//Grabs all related books from Toronto public library system
function appendTOBooks(){
	clear();
	
	const proxyurl = "https://cors-anywhere.herokuapp.com/";
	var bookUrl = book.replace(/ /g, "+");
	var url = 'https://www.torontopubliclibrary.ca/search.jsp?Ntt=' + book;

	fetch(proxyurl + url).then(function(result){
		return result.text();
	}).then(function(text){
		var parser = new DOMParser();
		var html = parser.parseFromString(text, 'text/html');

		var imgs = html.getElementsByClassName('image-container small-3 medium-2 columns');
		var i = 0;

		if(!imgs){
			var p = document.createElement('p');
			p.textContent = 'Sorry, No related titles were found';
			right.appendChild(p);
		}

		while(i < imgs.length){
			//Grab all book info, such as author, title, date published, and add it all to an array
			var outer = imgs[i].childNodes[1].childNodes[3].outerHTML.replace(/['"]+/g, '').split(';')[2];
			var re = /([-])\w+/g;
			outer = outer.replace(' class=save-item ', '');
			outer = outer.split('data').slice(2,6);
			outer.push(imgs[i].childNodes[1].childNodes[1].childNodes[1].src);
			var newDiv = document.createElement('div');
			var libDiv = document.createElement('div');

			newDiv.setAttribute('class', 'libraryDiv');
			libDiv.setAttribute('class', 'listDiv');

			appendLists(libDiv, outer, 'tor');

			var img = document.createElement('img');
			img.src = outer[outer.length-1];
			newDiv.appendChild(libDiv);
			newDiv.appendChild(img);

			right.appendChild(newDiv);
			i +=1;
		}
		div.appendChild(right);
	});
}

//Add book info to a li element
function appendLists(newDiv, arr, loc){

	for(var i = 0; i < arr.length-1; i++){

		var li = document.createElement('li');

		if(i === 0){
			li.style.fontSize = '18px';
		}
		else{
			li.style.fontSize = '12px';
		}

		li.setAttribute('class', 'bookInfo');

		if(loc === 'tor'){
			var temp = arr[i].indexOf('=');
			li.textContent = arr[i].slice(temp+1, arr[i].length);
		}

		else{
			li.textContent = arr[i];
		}
		newDiv.appendChild(li);
	}
}

//clears all library books
function clear(){
	while(right.childNodes.length > 1){
		right.removeChild(right.childNodes[1]);
	}
}

//Opens the hidden div used to display reviews and library info
function open(){
	div.style.height = '490px';
	div.style.border = '15px solid #1b2330';
	//div.style.border.borderWidth = '15px'

}

//Closes the div used to display reviews and library info
function close(){
	div.style.height = '0';
	div.style.border = 'none'
}










