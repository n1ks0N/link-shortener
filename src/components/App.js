import React, {
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  useMemo
} from 'react';
import { urlAd, keyAd } from '../constants/api.json';
import { fbDatabase } from '../constants/config';
import './App.css';

const App = () => {
  const [preloader, setPreloader] = useState(true);
  const [data, setData] = useState(null); // рекламный контент
  const [url, setUrl] = useState('');

  // поле ввода
  const [value, setValue] = useState('');
  const inputChanger = () => {
    setValue(() => urlRef.current.value);
  };

  const urlRef = useRef(value);

  // редирект по url
  useEffect(() => {
    const name = window.location.href.split('?')[1]; // проверка на наличие сокращенной ссылки
    if (name) {
      fbDatabase
        .database()
        .ref(`/${name}`)
        .on('value', (snapshot) => {
          const val = snapshot.val();
          val !== null
            ? (window.location.href = val.link)
            : (window.location.href = '/');
        });
    } else {
      setPreloader(false);
      let script = document.createElement('script');
      script.src = 'https://yastatic.net/share2/share.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // добавление рекламного контента
  useLayoutEffect(() => {
    let req = new XMLHttpRequest();
    req.onreadystatechange = () => {
      // eslint-disable-next-line
      if (req.readyState == XMLHttpRequest.DONE) {
        const result = JSON.parse(req.responseText).record;
        setData(() => result);
        for (let i = 0; i < result.header.banners.length; i++) {
          let script = document.createElement('script');
          script.src = result.header.banners[i].div.split(`'`)[3];
          script.async = true;
          document.body.appendChild(script);
        }
        for (let i = 0; i < result.header.linkslot.length; i++) {
          let script = document.createElement('script');
          script.src = result.header.linkslot[i].div.split(`'`)[13];
          script.async = true;
          document.body.appendChild(script);
        }
        for (let i = 0; i < result.footer.linkslot.length; i++) {
          let script = document.createElement('script');
          script.src = result.footer.linkslot[i].div.split(`'`)[13];
          script.async = true;
          document.body.appendChild(script);
        }
      }
    };
    req.open('GET', urlAd, true);
    req.setRequestHeader('X-Master-Key', keyAd);
    req.send();

    console.log(`
	   _ _                    
 _ __ (_) | _____  ___  _ __  
| '_ \\| | |/ / __|/ _ \\| '_ \\ 
| | | | |   <\\__ \\ (_) | | | |
|_| |_|_|_|\\_\\___/\\___/|_| |_|

Powered on ReactJS 
by https://github.com/n1ks0N
			`);
  }, []);

  // сокращение ссылки
  const shortUrl = () => {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' +
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
      '((\\d{1,3}\\.){3}\\d{1,3}))' +
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
      '(\\?[;&a-z\\d%_.~+=-]*)?' +
      '(\\#[-a-z\\d_]*)?$',
      'i'
    );
    if (pattern.test(value)) {
      let urlName = '';
      const alphabet = 'abcdefghijklmnopqrstuvwxyz1234567890';
      for (let i = 0; i < 6; i++) {
        urlName += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      }
      fbDatabase
        .database()
        .ref(`/${urlName}`)
        .set({
          link: value,
          url: `${window.location.href}?${urlName}`
        })
        .then(() => {
          fbDatabase
            .database()
            .ref(`/${urlName}`)
            .on('value', (snapshot) => {
              setUrl(snapshot.val().url);
            });
        });
    }
  };

  // уведомления
  const [alert, setAlert] = useState(false);
  const onFocus = (e) => {
    e.persist();
    e.target.select();
    navigator.clipboard.writeText(url);
    setAlert(true);
  };
  const copy = () => {
    navigator.clipboard.writeText(url);
    setAlert(true);
  };
  const alertStyle = useMemo(
    () => ({
      display: alert ? 'block' : 'none'
    }),
    [alert]
  );
  useEffect(() => {
    if (alert) {
      setTimeout(() => {
        setAlert(false);
      }, 3000);
    }
  }, [alert, setAlert]);
  return (
    <>
      {!preloader ? (
        <>
          <div className="bg"></div>
          <header>
            <h3>Сервис сокращения ссылок</h3>
          </header>
          <main>
            <div className="header">
              {/* рекламная секция linkslot */}
              <div className="ad__list ad__list__links">
                {!!data &&
                  data.header.textButtons.map((data, i) => (
                    <a
                      className="ad__list__links"
                      key={i}
                      target="_blank"
                      rel="noreferrer"
                      href={`${data.link}`}
                    >
                      {data.text}
                    </a>
                  ))}
              </div>
              <div className="ad__list">
                {!!data &&
                  data.header.linkslot.map((data, i) => (
                    <div
                      key={i}
                      dangerouslySetInnerHTML={{ __html: data.div }}
                    />
                  ))}
              </div>
              <div className="ad__list">
                {!!data &&
                  data.header.banners.map((data, i) => (
                    <div
                      key={i}
                      dangerouslySetInnerHTML={{ __html: data.div }}
                    />
                  ))}
              </div>
            </div>
            <div className="app">
              <h1 align="center">Сервис сокращения ссылок</h1>
              <h2 align="center">Сократите ссылку в один шаг:</h2>
              <div className="main">
                <div className="input-group">
                  <input
                    type="url"
                    className="form-control"
                    id="url"
                    placeholder="https://example.com/"
                    ref={urlRef}
                    value={value}
                    onChange={inputChanger}
                  />
                  <button
                    type="button"
                    className="btn btn-success btn-lg"
                    onClick={shortUrl}
                  >
                    Сократить
									</button>
                </div>
                {!!url && (
                  <div className="input-group">
                    <input
                      type="url"
                      className="form-control"
                      value={url}
                      onClick={(e) => onFocus(e)}
                      disabled
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={copy}
                    >
                      Скопировать
										</button>
                  </div>
                )}
              </div>
              {/* <center>
                <p>
                  Если вам был полезен наш Сервис сокращения,
									<br />
									Вы можете пожертвовать сколько не жалко..
								</p>
                <iframe
                  title="Пожертвование"
                  src="https://yoomoney.ru/quickpay/shop-widget?writer=buyer&targets=%D0%9F%D0%BE%D0%B6%D0%B5%D1%80%D1%82%D0%B2%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5&targets-hint=%D0%9F%D0%BE%D0%B6%D0%B5%D1%80%D1%82%D0%B2%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5&default-sum=10&button-text=14&payment-type-choice=on&mobile-payment-type-choice=on&hint=&successURL=&quickpay=shop&account=410014949986324"
                  width="423"
                  height="227"
                  frameBorder="0"
                  allowtransparency="true"
                  scrolling="no"
                />
              </center> */}
              <div className="ad__list ad__list__column">
                {!!data &&
                  data.footer.banners.map((data, i) => (
                    <div
                      key={i}
                      dangerouslySetInnerHTML={{ __html: data.div }}
                    />
                  ))}
              </div>
            </div>
            <div className="ad__list">
              {!!data &&
                data.footer.linkslot.map((data, i) => (
                  <div key={i} dangerouslySetInnerHTML={{ __html: data.div }} />
                ))}
            </div>
          </main>
          <footer>
            <div className="footer__socials">
              <h2 className="footer__title">Группы в соцсетях:</h2>
              <div className="footer__links">
                {!!data &&
                  data.footer.socials.map((data, i) => (
                    <a key={i} href={data.link} className="footer__link">{data.text}</a>
                  ))}
              </div>
            </div>
            {/* <iframe
              title="Обратная связь"
              src="https://forms.yandex.ru/u/6035357ceac8405adc0ccc53/?iframe=1"
              frameBorder="0"
              name="ya-form-6035357ceac8405adc0ccc53"
              width="650"
            /> */}
            <div className="hider">
              © 2021 <br />
							Создание сайтов — Nikson
						</div>
          </footer>
          <div
            className="alert alert-secondary main__alert"
            style={alertStyle}
            role="alert"
          >
            Скопировано
					</div>
        </>
      ) : (
        <div className="loader">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden"></span>
          </div>
        </div>
      )}
      <div className="ya-share2" data-curtain data-size="l" data-shape="round" data-services="vkontakte,facebook,odnoklassniki,telegram,twitter,viber,whatsapp,moimir" />
    </>
  );
};

export default App;
