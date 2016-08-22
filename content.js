console.log('/* content.js */')

// helper function to walk a NodeList
// https://toddmotto.com/ditch-the-array-foreach-call-nodelist-hack/
const walkNodes = (array, callback, scope) => {
  for (let i = 0; i < array.length; i++) {
    callback.call(scope, i, array[i])
  }
}

// helper function to insert a dom node after a given element
const insertAfter = (newNode, referenceNode) => {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

const headerRow = document.querySelector('table > thead > tr')

// add network column header
const networkHeader = document.createElement('th')
networkHeader.classList.add('col-header-network')
networkHeader.textContent = 'Network'
insertAfter(networkHeader, headerRow.children[0])

// add location column header
const locationHeader = document.createElement('th')
locationHeader.classList.add('col-header-location')
locationHeader.textContent = 'Location'
insertAfter(locationHeader, headerRow.querySelector('.col-header-network'))

// add a column to each row
const userRows = document.querySelectorAll('table > tbody > tr')
walkNodes(userRows, (index, userRow) => {
  // make network col
  const networkCol = document.createElement('td')
  networkCol.classList.add('col-network')
  networkCol.textContent = 'Loading...'
  insertAfter(networkCol, userRow.children[0])

  // make location col
  const locationCol = document.createElement('td')
  locationCol.classList.add('col-location')
  locationCol.textContent = 'Loading...'
  insertAfter(locationCol, userRow.querySelector('.col-network'))

  // get ip address
  const ipColText = userRow.querySelector('.col-user').textContent
  const ip = ipColText.match(/(\d{1,3}.){3}\d{1,3}/)[0]
  
  // make request to ipinfo, daringly without jquery.
  const xhr = new XMLHttpRequest()
  const url = 'http://ipinfo.io/' + ip + '/json'
  xhr.open('GET', url)
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      const data = JSON.parse(xhr.responseText)

      // populate network info
      const org = data.org
      const orgParts = org.split(' ')
      const networkKey = orgParts[0]
      const networkName = orgParts.slice(1).join(' ')
      const networkLink = document.createElement('a')
      networkLink.href = 'http://ipinfo.io/' + networkKey
      networkLink.textContent = networkName
      networkCol.textContent = ''
      // userRow.querySelector('.col-network').appendChild(networkLink)
      networkCol.appendChild(networkLink)

      // populate location
      const city = data.city
      const region = data.region
      const country = data.country
      const location = [city, region, country]
                          .filter(part => !!part)
                          .join(', ')
      const xy = data.loc
      const locationLink = document.createElement('a')
      locationLink.href = 'https://maps.google.com/?ll=' + xy
      locationLink.textContent = location
      locationCol.textContent = ''
      locationCol.appendChild(locationLink)
    }
  }
  xhr.send()
})
