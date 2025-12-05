import React from 'react';

type Props = any;

export const Feather = (props: Props) => {
  const { children, ...rest } = props || {};
  return React.createElement('span', rest, children || null);
};

export default {
  Feather,
};
