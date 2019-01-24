import { insert } from 'ramda';

const BASE_URL = 'http://localhost:3000/nanny.jpg';
const DEFAULT_TAB = 'standard';

const tabs = {
  standard: createHandler('standard'),
  resize: createHandler('resize'),
  fit: createHandler('fit'),
  lb: createHandler('lb'),
  crop: createHandler('crop'),
};

const handleVisible = tabPath => {
  Object.keys(tabs).forEach(key => {
    const handler = tabs[key];
    if (key === tabPath) handler.onMount();
    else handler.onUnmount();
  });
};

$('.menu .item').tab({
  onVisible: handleVisible,
});

$('.menu .item').tab('change tab', DEFAULT_TAB);
handleVisible(DEFAULT_TAB);
if ('module' in window && module.hot)
  module.hot.dispose(() => handleVisible(false));

function createHandler(tabName) {
  const $form = $(`#${tabName}-form`);
  const $clearButton = $(`#${tabName}-clear`);
  const view = {
    $image: $(`#${tabName}-image`),
    $url: $(`#${tabName}-url`),
  };

  function onFormChange() {
    const values = $(this).serializeArray();
    const queryString = values
      .reduce((acc, { name, value }) => {
        if (value && name.includes('[')) {
          const fieldName = name.replace(/\[\d+\]/, '');
          const [, index] = /\[(\d+)\]/.exec(name);

          const existingValues = acc.find(n => n.includes(fieldName));
          if (!existingValues) {
            return acc.concat(`${fieldName}=${value}`);
          }

          const values = /^\w+=(.+)$/.exec(existingValues)[1].split(',');
          const nextValues = insert(Number.parseInt(index), value, values);
          return acc
            .filter(f => !f.includes(fieldName))
            .concat(`${fieldName}=${nextValues.join(',')}`);
        }

        if (value) return acc.concat(`${name}=${value}`);
        return acc;
      }, [])
      .join('&');

    const url = `${BASE_URL}${queryString ? '?' : ''}${queryString}`;
    view.$image.prop('src', url.replace('#', '%23'));
    view.$url.text(url);
  }

  const onClear = event => {
    $form.trigger('reset');
    $form.trigger('change');
  };

  return {
    onMount: () => {
      $clearButton.on('click', onClear);
      $form.on('change', onFormChange);
      $form.trigger('change');
    },
    onUnmount: () => {
      $clearButton.off('click', onClear);
      $form.off('change', onFormChange);
    },
  };
}
