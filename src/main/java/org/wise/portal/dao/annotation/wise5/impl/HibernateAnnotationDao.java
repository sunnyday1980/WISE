package org.wise.portal.dao.annotation.wise5.impl;

import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.annotation.wise5.AnnotationDao;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.vle.domain.annotation.wise5.Annotation;
import org.wise.vle.domain.work.NotebookItem;
import org.wise.vle.domain.work.StudentWork;

import java.util.List;

/**
 * @author Hiroki Terashima
 */
@Repository("wise5AnnotationDao")
public class HibernateAnnotationDao extends AbstractHibernateDao<Annotation> implements AnnotationDao<Annotation> {

    @Override
    protected String getFindAllQuery() {
        return null;
    }

    @Override
    protected Class<? extends Annotation> getDataObjectClass() {
        return null;
    }

    @Override
    public List<Annotation> getAnnotationsByParams(
            Integer id, Run run, Group period, WISEWorkgroup fromWorkgroup, WISEWorkgroup toWorkgroup,
            String nodeId, String componentId, StudentWork studentWork, String localNotebookItemId, NotebookItem notebookItem, String type) {

        Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        Criteria sessionCriteria = session.createCriteria(Annotation.class);

        if (id != null) {
            sessionCriteria.add(Restrictions.eq("id", id));
        }
        if (run != null) {
            sessionCriteria.add(Restrictions.eq("run", run));
        }
        if (period != null) {
            sessionCriteria.add(Restrictions.eq("period", period));
        }
        if (fromWorkgroup != null) {
            sessionCriteria.add(Restrictions.eq("fromWorkgroup", fromWorkgroup));
        }
        if (toWorkgroup != null) {
            sessionCriteria.add(Restrictions.eq("toWorkgroup", toWorkgroup));
        }
        if (nodeId != null) {
            sessionCriteria.add(Restrictions.eq("nodeId", nodeId));
        }
        if (componentId != null) {
            sessionCriteria.add(Restrictions.eq("componentId", componentId));
        }
        if (studentWork != null) {
            sessionCriteria.add(Restrictions.eq("studentWork", studentWork));
        }
        if (notebookItem != null) {
            sessionCriteria.add(Restrictions.eq("notebookItem", notebookItem));
        }
        if (localNotebookItemId != null) {
            sessionCriteria.add(Restrictions.eq("localNotebookItemId", localNotebookItemId));
        }
        if (type != null) {
            sessionCriteria.add(Restrictions.eq("type", type));
        }

        return sessionCriteria.list();
    }
}
