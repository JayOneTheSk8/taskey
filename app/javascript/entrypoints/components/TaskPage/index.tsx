import React, { useContext } from 'react'
import { withStyles } from '@material-ui/core'
import { useQuery } from '@apollo/client';

import { AuthContext } from '../../authContext';
import { ME_QUERY } from '../../queries/auth';

const TaskPage = ({ classes }: {[key: string]: any}) => {
  const context = useContext(AuthContext)

  const { data, loading, error } = useQuery(ME_QUERY, {
    onCompleted(data) {
      const { id, username } = data.me;
      context.login({ id, username })
    }
  });

  if (error) return <div>ERROR</div>
  if (loading) return <div>LOADING...</div>

  return (
    <>
      <div>{`${data.me.username}'s Tasks Here`}</div>
    </>
  )
}

const styles = () => ({
  taskPage: {

  }
})

export default withStyles(styles)(TaskPage)
