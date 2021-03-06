// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import { Spring, animated, Trail } from 'react-spring'
//
import { defaultStyles } from './index.style'

type tProps = {
  isActive: boolean,
  items: Array<{
    url: string,
    id: string | number,
    title: string,
    items?: Array<{
      url: string,
      id: string | number,
      title: string,
    }>,
  }>,
  rootId?: string,
  css?: '', // returned class string of emotion's css function
  aboveMenuRender?: () => any,
  belowMenuRender?: () => any,
  itemRender: (item: any, styles: any) => any,
}

type tState = {
  scrollTop: number,
  prevScrollTop: number,
  activeSubMenus: {},
}

export class OverlayMenu extends React.Component<tProps, tState> {
  root: any
  mount: any
  rootId: string
  activeSubMenusDefaultState: {}
  state = {
    scrollTop: 0,
    prevScrollTop: 0,
    activeSubMenus: {},
  }
  constructor(props: tProps) {
    super(props)

    this.activeSubMenusDefaultState = {
      ...this.props.items.reduce(
        (obj, item) => ({ ...obj, [item.id]: false }),
        {},
      ),
    }

    this.state.activeSubMenus = this.activeSubMenusDefaultState

    if (typeof document !== 'undefined') {
      this.rootId = props.rootId || 'root'
      this.root = document.getElementById(this.rootId)
      this.mount = document.createElement('div')
    }
  }
  componentDidMount() {
    if (typeof document !== 'undefined') {
      window.addEventListener('scroll', this.handleScroll, false)
      this.root.appendChild(this.mount)
    }
  }
  componentWillUnmount() {
    if (typeof document !== 'undefined') {
      window.removeEventListener('scroll', this.handleScroll, false)
      this.root.removeChild(this.mount)
    }
  }

  componentDidUpdate(prevProps: tProps, prevState: tState) {
    if (typeof document !== 'undefined') {
      // menu was active, but is about to not be
      if (prevProps.isActive && !this.props.isActive) {
        window.scrollTo(0, prevState.prevScrollTop)

        document
          .getElementsByTagName('body')[0]
          .classList.remove('component-overlay-menu-active')
        // menu wasn't active, but is about to be
      } else if (!prevProps.isActive && this.props.isActive) {
        //         window.scrollTo(0, this.state.scrollTop)
        this.setState({ prevScrollTop: prevState.scrollTop })
        window.scrollTo(0, 0)

        document
          .getElementsByTagName('body')[0]
          .classList.add('component-overlay-menu-active')
      }
    }
  }

  toggleSubItem = (id: string | number) => {
    this.setState(prevState => {
      return {
        activeSubMenus: {
          ...this.activeSubMenusDefaultState,
          [id]: !prevState.activeSubMenus[id],
        },
      }
    })
  }

  handleScroll = () => {
    if (typeof document !== 'undefined') {
      const scrollTop =
        window.pageYOffset ||
        (document.documentElement ? document.documentElement.scrollTop : 0)

      this.setState({
        scrollTop,
      })
    }
  }

  render() {
    const {
      itemRender,
      aboveMenuRender,
      belowMenuRender,
      isActive,
      items,
      rootId,
      css,
      ...props
    } = this.props

    return isActive
      ? ReactDOM.createPortal(
          <Spring from={{ opacity: 0 }} to={{ opacity: 1 }} native>
            {styles => (
              <animated.div
                style={styles}
                className={`${defaultStyles} ${css || ''}`}
                {...props}
              >
                {aboveMenuRender && aboveMenuRender()}
                <nav>
                  <Trail
                    from={{ opacity: 0 }}
                    to={{ opacity: 1 }}
                    keys={items.map(item => item.id)}
                    native
                  >
                    {items.map(item => styles =>
                      itemRender({
                        item,
                        styles,
                        toggleSubMenu: this.toggleSubItem,
                        subMenuActive: this.state.activeSubMenus[item.id],
                      }),
                    )}
                  </Trail>
                </nav>
                {belowMenuRender && belowMenuRender()}
              </animated.div>
            )}
          </Spring>,
          // $FlowFixMe
          this.mount,
        )
      : null
  }
}
